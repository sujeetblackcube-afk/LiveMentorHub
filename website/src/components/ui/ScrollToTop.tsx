"use client";

import React, { useState, useEffect } from "react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to Top"
      className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all hover:bg-blue-500 hover:scale-110 active:scale-95"
    >
      ↑
    </button>
  );
}
