import { v2 as Cloudinary, type UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";
import { fileTypeFromBuffer } from "file-type";

dotenv.config();

export type UploadFileResult = {
  secure_url?: string; // https URL for delivery (if available)
  url?: string; // fallback url
  public_id: string;
  resource_type: string; // 'image' | 'video' | 'raw' | etc.
  bytes?: number;
  mime_type?: string | null;
  original_filename?: string | null;
  raw?: UploadApiResponse;
  optimized_url?: string;
};

export type UploadOptions = {
  folder?: string;
  public_id?: string;
  tags?: string | string[];
  context?: Record<string, string>;
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  forceResourceType?: "auto" | "image" | "video" | "raw";
};

export class CloudinaryService {
  constructor() {
    Cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
  }

  private getOptimizedUrl(resource: any): string {
    return Cloudinary.url(resource.public_id, {
      resource_type: resource.resource_type,
      secure: true,
      transformation: [
        {
          fetch_format: resource.resource_type === "video" ? "webm" : "webp",
          quality: "auto",
        },
      ],
    });
  }

  async deleteImageVideo(public_id: string[]) {
    try {
      const [imgRes, vidRes] = await Promise.all([
        Cloudinary.api.delete_resources(public_id, { resource_type: "image" }),
        Cloudinary.api.delete_resources(public_id, { resource_type: "video" }),
      ]);
      console.log("del", imgRes, vidRes);
      return [imgRes, vidRes];
    } catch (err) {
      console.error("deleteImageVideoService error:", err);
      throw err;
    }
  }

  async listImages(folderPrefix = "", dynamicMode = false): Promise<any[]> {
    let resources: any[] = [];
    let nextCursor: string | undefined = undefined;

    if (dynamicMode) {
      do {
        const response: any = await Cloudinary.api.resources_by_asset_folder(
          folderPrefix,
          {
            max_results: 500,
            next_cursor: nextCursor,
          },
        );
        resources.push(...(response.resources || []));
        nextCursor = response.next_cursor;
      } while (nextCursor);
    }

    return resources.map((res) => ({
      ...res,
      optimized_url: this.getOptimizedUrl(res),
    }));
  }

  async listImagesByTags(tags: string[]): Promise<any> {
    try {
      const tagsExpression = tags.map((tag) => `${tag}`).join(" OR ");
      const expression = `tags=(${tagsExpression})`;

      const result = await Cloudinary.search
        .expression(expression)
        .with_field("tags")
        .with_field("context")
        .max_results(100)
        .execute();
      return result.resources.map((res) => ({
        ...res,
        optimized_url: this.getOptimizedUrl(res),
      }));
    } catch (error: any) {
      console.error("Error fetching images by tags:", error);
      return [];
    }
  }

  async listByMetadata(
    metadataKey: string,
    metadataValue: string,
    folder: string,
  ): Promise<any[]> {
    try {
      console.log(metadataKey, metadataValue);
      const expr = `context.${metadataKey}=${metadataValue}`;

      const exp = `folder:"${folder}" AND ${expr}`;

      const res = await Cloudinary.search
        .expression(exp)
        .with_field("context")
        .max_results(100)
        .execute();

      return res.resources.map((res) => ({
        ...res,
        optimized_url: this.getOptimizedUrl(res),
      }));
    } catch (err: any) {
      console.error("Error fetching metadata ", err.message);
      return [];
    }
  }

  async uploadMultipleMedia(
    sources: (File | Buffer | ArrayBuffer | Uint8Array | string)[],
    options: UploadOptions = {},
  ) {
    const {
      folder,
      public_id,
      tags,
      allowedMimeTypes,
      context,
      forceResourceType,
      maxSizeBytes,
    } = options;

    if (!sources || sources.length === 0) {
      throw new Error("No sources provided");
    }

    try {
      const uploadPromises = sources.map((source) =>
        this.uploadMedia(source, options),
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error: any) {
      console.error("media upload or multiple media upload failed!", error);
      throw new Error(`Batch uploading failed: ${error.message}`);
    }
  }

  async uploadMedia(
    source: File | Buffer | ArrayBuffer | Uint8Array | string,
    options: UploadOptions = {},
  ) {
    const {
      folder,
      public_id,
      tags,
      allowedMimeTypes,
      context,
      forceResourceType,
      maxSizeBytes,
    } = options;

    const isVideoMime = (mime: string | null | undefined): boolean =>
      !!mime && mime.startsWith("video/");

    const toBuffer = async (
      src: typeof source,
    ): Promise<{
      buffer?: Buffer;
      detectedMime?: string | null;
      originalName?: string | null;
      isString?: boolean;
    }> => {
      if (typeof src === "string") {
        // remote URL — no buffer
        return {
          buffer: undefined,
          detectedMime: null,
          originalName: null,
          isString: true,
        };
      }

      if (Buffer.isBuffer(src)) {
        const detected = await fileTypeFromBuffer(src);
        return {
          buffer: src,
          detectedMime: detected?.mime ?? null,
          originalName: null,
        };
      }

      if (typeof (src as any)?.arrayBuffer === "function") {
        const arr = await (src as any).arrayBuffer();
        const buf = Buffer.from(arr);
        const detected = await fileTypeFromBuffer(buf);
        const name = (src as any)?.name ?? null;
        return {
          buffer: buf,
          detectedMime: detected?.mime ?? null,
          originalName: name,
        };
      }

      if (src instanceof ArrayBuffer) {
        const buf = Buffer.from(new Uint8Array(src));
        const detected = await fileTypeFromBuffer(buf);
        return {
          buffer: buf,
          detectedMime: detected?.mime ?? null,
          originalName: null,
        };
      }

      if (src instanceof Uint8Array) {
        const buf = Buffer.from(src);
        const detected = await fileTypeFromBuffer(buf);
        return {
          buffer: buf,
          detectedMime: detected?.mime ?? null,
          originalName: null,
        };
      }

      return { buffer: undefined, detectedMime: null, originalName: null };
    };

    const { buffer, detectedMime, originalName, isString } =
      await toBuffer(source);

    // If user forced a resource type, use it. Otherwise infer:
    let resource_type: "auto" | "image" | "video" | "raw" =
      (forceResourceType as any) ?? "auto";

    if (!forceResourceType) {
      if (buffer && detectedMime) {
        resource_type = isVideoMime(detectedMime) ? "video" : "auto";
      } else if (isString && typeof source === "string") {
        // Use file extension heuristic for URLs e.g. .mp4, .mov, .webm
        const lower = source.toLowerCase();
        if (/\.(mp4|mov|m4v|webm|mkv|avi|flv)(\?|$)/.test(lower)) {
          resource_type = "video";
        } else if (/\.(jpe?g|png|gif|webp|avif)(\?|$)/.test(lower)) {
          resource_type = "image";
        } else {
          resource_type = "auto";
        }
      }
    }

    const uploadOpts: Record<string, any> = {
      resource_type,
      folder,
    };

    if (public_id) uploadOpts.public_id = public_id;
    if (tags) uploadOpts.tags = tags;
    if (context) uploadOpts.context = context;

    // For videos, add chunking to help larger uploads
    if (resource_type === "video") {
      uploadOpts.chunk_size = 6 * 1024 * 1024; // 6MB
    }

    // Size validation (only when we actually have a buffer or File)
    if (
      typeof maxSizeBytes === "number" &&
      buffer &&
      buffer.length > maxSizeBytes
    ) {
      throw new Error(
        `File too large: ${buffer.length} bytes (max ${maxSizeBytes})`,
      );
    }

    // MIME whitelist check (only if detectedMime exists)
    if (
      allowedMimeTypes &&
      detectedMime &&
      !allowedMimeTypes.includes(detectedMime)
    ) {
      throw new Error(`MIME type not allowed: ${detectedMime}`);
    }

    let result: UploadApiResponse;

    try {
      if (!buffer) {
        throw new Error(
          "Unsupported source type: cannot convert to buffer or upload a string URL",
        );
      }

      console.log("🔍 Detected mime:", detectedMime);
      console.log(
        "🔍 Final upload options about to be sent to Cloudinary:",
        uploadOpts,
      );

      // --- If video: use uploader.upload with data URI (reliable for server-side signed uploads)
      if (uploadOpts.resource_type === "video") {
        // Convert buffer to data URI and upload via uploader.upload()
        const dataUri = `data:${detectedMime ?? "video/mp4"};base64,${buffer.toString(
          "base64",
        )}`;

        // Use uploader.upload - it worked in your test-upload-file.js and is more reliable than stream in this environment
        result = (await Cloudinary.uploader.upload_large(
          dataUri,
          uploadOpts,
        )) as UploadApiResponse;
      } else {
        // Non-video: continue using upload_stream but write buffer directly
        result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploader = Cloudinary.uploader.upload_stream(
            uploadOpts,
            (err, res) => {
              if (err) return reject(err);
              resolve(res as UploadApiResponse);
            },
          );
          uploader.end(buffer);
        });
      }
    } catch (err: any) {
      console.error("❌ Cloudinary upload error details:", {
        message: err?.message ?? String(err),
        name: err?.name,
        http_code: err?.http_code ?? null,
        raw: err?.error ?? err,
      });
      const message = err?.message ?? String(err);
      throw new Error(`Cloudinary upload failed: ${message}`);
    }

    const out: UploadFileResult = {
      secure_url: result.secure_url,
      url: result.url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      bytes: result.bytes,
      mime_type: detectedMime ?? (result.format ? `${result.format}` : null),
      original_filename: result.original_filename ?? originalName ?? null,
      raw: result,
      optimized_url: this.getOptimizedUrl(result),
    };
    return out;
  }
}
