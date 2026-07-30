/**
 * Utility function to download files (videos, PDFs, images) with their correct file extension.
 * Handles Cloudinary URLs, blob downloads, and MIME-type based extension resolution.
 * 
 * @param {string} url - The URL of the file to download
 * @param {string} fallbackName - Desired filename
 * @param {string} contentType - Optional content type hint ('RECORDED_VIDEO', 'DOCUMENT', 'IMAGE', etc.)
 */
export const downloadFile = async (url, fallbackName = "download", contentType = "") => {
  if (!url) {
    console.error("No download URL provided");
    return;
  }

  try {
    // 1. Clean URL and detect extension from URL path
    const cleanUrl = url.split("?")[0];
    let ext = "";
    const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
      ext = match[1].toLowerCase();
    }

    // 2. Try fetching as Blob to trigger local download with forced filename
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // 3. If extension wasn't in URL, infer from blob MIME type or contentType parameter
    if (!ext || ext.length > 5) {
      const mime = (blob.type || "").toLowerCase();
      if (mime.includes("video/mp4") || mime.includes("mp4")) ext = "mp4";
      else if (mime.includes("video/webm") || mime.includes("webm")) ext = "webm";
      else if (mime.includes("video/quicktime") || mime.includes("mov")) ext = "mov";
      else if (mime.includes("video/x-matroska") || mime.includes("mkv")) ext = "mkv";
      else if (mime.includes("video")) ext = "mp4";
      else if (mime.includes("application/pdf") || mime.includes("pdf")) ext = "pdf";
      else if (mime.includes("image/png")) ext = "png";
      else if (mime.includes("image/jpeg") || mime.includes("image/jpg")) ext = "jpg";
      else if (mime.includes("image/webp")) ext = "webp";
      else if (contentType === "RECORDED_VIDEO" || contentType === "VIDEO") ext = "mp4";
      else if (contentType === "DOCUMENT" || contentType === "NOTES") ext = "pdf";
      else if (contentType === "IMAGE") ext = "jpg";
      else ext = "mp4"; // default for videos
    }

    // 4. Format filename with valid extension
    let finalFileName = (fallbackName || "download").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    if (ext && !finalFileName.toLowerCase().endsWith(`.${ext}`)) {
      finalFileName = `${finalFileName}.${ext}`;
    }

    // 5. Trigger download via hidden <a> element
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);

  } catch (error) {
    console.warn("Direct blob download failed, falling back to attachment URL:", error);
    
    // Fallback: For Cloudinary URLs, insert fl_attachment to force extension & download header
    let downloadUrl = url;
    if (url.includes("cloudinary.com") && !url.includes("fl_attachment")) {
      const urlParts = url.split("/upload/");
      if (urlParts.length === 2) {
        // Extract extension or infer it
        let ext = "mp4";
        if (contentType === "DOCUMENT") ext = "pdf";
        else if (contentType === "IMAGE") ext = "jpg";
        
        const cleanName = (fallbackName || "download").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
        downloadUrl = `${urlParts[0]}/upload/fl_attachment:${cleanName}_${ext}/${urlParts[1]}`;
      }
    }
    
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
