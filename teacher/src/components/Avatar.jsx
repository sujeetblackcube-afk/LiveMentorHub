import React, { useState, memo } from "react";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";

const Avatar = memo(({ src, name = "", alt = "Avatar", size = "w-9 h-9", className = "" }) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "LM";

  const getFullImageUrl = (img) => {
    if (!img || typeof img !== 'string') return null;
    const trimmed = img.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:image/")) {
      if (trimmed.includes("res.cloudinary.com") && !trimmed.includes("f_auto,q_auto")) {
        return trimmed.replace("/upload/", "/upload/f_auto,q_auto,w_200/");
      }
      return trimmed;
    }
    const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000";
    const cleanBase = baseUrl.replace(/\/$/, "");
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${cleanBase}${cleanPath}`;
  };

  const fullImageUrl = getFullImageUrl(src);

  return fullImageUrl && !imgError ? (
    <img
      src={fullImageUrl}
      alt={alt || name}
      className={`${size} rounded-full object-cover border border-slate-200 shadow-2xs ${className}`}
      onError={() => setImgError(true)}
    />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-2xs uppercase tracking-wider shrink-0 ${className}`}>
      {initials}
    </div>
  );
});

Avatar.displayName = "Avatar";
export default Avatar;
