/**
 * Cloudinary Dynamic URL Optimization Helper
 * Injects resolution limits and auto-formatting flags:
 * - Images: f_auto,q_auto,w_800,c_limit (WebP/AVIF auto-format, 60-80% size compression, max 800px width)
 * - Videos: f_auto,q_auto,vc_auto,w_1280,c_limit (Auto video codec, adaptive stream quality, max 1280px width)
 */

export const optimizeCloudinaryUrl = (url, isVideo = false) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return url;
  }

  // Prevent double injection
  if (url.includes('/f_auto,q_auto')) {
    return url;
  }

  const flags = isVideo
    ? 'f_auto,q_auto,vc_auto,w_1280,c_limit'
    : 'f_auto,q_auto,w_800,c_limit';

  return url.replace('/upload/', `/upload/${flags}/`);
};

export const optimizeMediaUrl = (url, type = 'image') => {
  const isVideo = type === 'video' || (url && (url.endsWith('.mp4') || url.endsWith('.m3u8') || url.endsWith('.mov')));
  return optimizeCloudinaryUrl(url, isVideo);
};
