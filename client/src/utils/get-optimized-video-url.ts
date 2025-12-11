export default function getOptimizedVideoUrl(url: string): string {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);

    // Remove unnecessary query params (_a, etc.)
    parsedUrl.search = "";

    // Insert /f_auto,q_auto/ after /upload/
    const uploadIndex = parsedUrl.pathname.indexOf("/upload/");
    if (uploadIndex === -1) return url; // not a Cloudinary upload URL

    const beforeUpload = parsedUrl.pathname.slice(0, uploadIndex + 8); // include "/upload/"
    const afterUpload = parsedUrl.pathname.slice(uploadIndex + 8);

    parsedUrl.pathname = `${beforeUpload}f_auto,q_auto/${afterUpload}`;
    console.log(parsedUrl.toString());

    return parsedUrl.toString();
  } catch (e) {
    console.warn("Invalid URL passed to getOptimizedVideoUrl:", url);
    return url; // fallback
  }
}
