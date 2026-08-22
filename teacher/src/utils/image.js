export const DEFAULT_BANNER_IMAGE = "https://res.cloudinary.com/tivvs1hg/image/upload/v1784356473/banners/owvuikvq07d3nldssn5h.jpg";

export function getImageUrl(imagePath, fallback = DEFAULT_BANNER_IMAGE) {
  if (!imagePath || typeof imagePath !== "string" || !imagePath.trim()) {
    return fallback;
  }
  const trimmed = imagePath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  const baseUrl = import.meta.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
}
