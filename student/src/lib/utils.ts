import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const DEFAULT_COURSE_IMAGE = "https://res.cloudinary.com/tivvs1hg/image/upload/v1784356473/banners/owvuikvq07d3nldssn5h.jpg";

export function getImageUrl(imagePath?: string | null, fallback: string = DEFAULT_COURSE_IMAGE): string {
    if (!imagePath || typeof imagePath !== "string" || imagePath.trim() === "") {
        return fallback;
    }
    const trimmed = imagePath.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:image/")) {
        return trimmed;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const cleanBase = apiBase.replace(/\/$/, "");
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${cleanBase}${cleanPath}`;
}

export async function downloadFile(url: string, fallbackName: string = "download", contentType: string = "") {
    if (!url) return;

    try {
        const cleanUrl = url.split("?")[0];
        let ext = "";
        const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
        if (match) {
            ext = match[1].toLowerCase();
        }

        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

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
            else ext = "mp4";
        }

        let finalFileName = (fallbackName || "download").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
        if (ext && !finalFileName.toLowerCase().endsWith(`.${ext}`)) {
            finalFileName = `${finalFileName}.${ext}`;
        }

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
        
        let downloadUrl = url;
        if (url.includes("cloudinary.com") && !url.includes("fl_attachment")) {
            const urlParts = url.split("/upload/");
            if (urlParts.length === 2) {
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
}
