// Cloudinary Image Optimization Utility
export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";
export const DEFAULT_BANNER = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800";

export const getOptimizedImageUrl = (url, width = 400) => {
  if (!url) return DEFAULT_AVATAR;
  if (url.includes("res.cloudinary.com") && !url.includes("f_auto,q_auto")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
};
