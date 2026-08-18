import React, { useState, memo } from 'react';
import { BACKEND_BASE_URL } from '../utils/constants';

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";

const Avatar = memo(function Avatar({ name, image, size = "w-9 h-9" }) {
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
    const cleanBase = (BACKEND_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${cleanBase}${cleanPath}`;
  };

  const fullImageUrl = getFullImageUrl(image);

  return fullImageUrl && !imgError ? (
    <img
      src={fullImageUrl}
      alt={name || "Avatar"}
      className={`${size} rounded-full object-cover border border-slate-200 shadow-2xs`}
      onError={() => setImgError(true)}
    />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-2xs uppercase tracking-wider shrink-0`}>
      {initials}
    </div>
  );
});

export default Avatar;
