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
