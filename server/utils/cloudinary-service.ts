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

    return resources;
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
      return result.resources;
    } catch (error) {
      console.error("Error fetching images by tags:", error);
      return [];
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

    const toBuffer = async (
      src: typeof source,
    ): Promise<{
      buffer?: Buffer;
      detectedMime?: string | null;
      originalName?: string | null;
    }> => {
      if (typeof src === "string") {
        return { buffer: undefined };
      }

      if (Buffer.isBuffer(src)) {
        const detected = await fileTypeFromBuffer(src);
        return { buffer: src, detectedMime: detected?.mime ?? null };
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
        return { buffer: buf, detectedMime: detected?.mime ?? null };
      }

      if (src instanceof Uint8Array) {
        const buf = Buffer.from(src);
        const detected = await fileTypeFromBuffer(buf);
        return { buffer: buf, detectedMime: detected?.mime ?? null };
      }

      return { buffer: undefined };
    };

    const resource_type = forceResourceType ?? "auto";

    const uploadOpts: Record<string, any> = {
      resource_type,
      folder,
      fetch_format:
        resource_type === "image"
          ? "webp"
          : resource_type === "video"
            ? "webm"
            : "auto",
    };

    if (public_id) uploadOpts.public_id = public_id;
    if (tags) uploadOpts.tags = tags;
    if (context) uploadOpts.context = context;

    const { buffer, detectedMime, originalName } = await toBuffer(source);

    if (
      typeof maxSizeBytes === "number" &&
      buffer &&
      buffer.length > maxSizeBytes
    ) {
      throw new Error(
        `File too large: ${buffer.length} bytes (max ${maxSizeBytes})`,
      );
    }

    if (
      allowedMimeTypes &&
      detectedMime &&
      !allowedMimeTypes.includes(detectedMime)
    ) {
      throw new Error(`MIME type not allowed: ${detectedMime}`);
    }

    let result: UploadApiResponse;

    try {
      if (buffer) {
        result = await new Promise((resolve, reject) => {
          const uploader = Cloudinary.uploader.upload_stream(
            uploadOpts,
            (err, res) => {
              if (err) return reject(err);
              resolve(res as UploadApiResponse);
            },
          );
          streamifier.createReadStream(buffer).pipe(uploader);
        });
      } else {
        throw new Error(
          "Unsupported source type: cannot convert to buffer or upload a string URL",
        );
      }
    } catch (err: any) {
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
    };
    return out;
  }
}
