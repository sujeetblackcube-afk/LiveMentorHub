"use client";

import React, { useEffect } from "react";

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  icon?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export function Toast({ toast, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-2xl border border-blue-500/30 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
      {toast.icon && <span className="text-2xl">{toast.icon}</span>}
      <div className="flex-1">
        <h4 className="text-sm font-extrabold text-blue-400">{toast.title}</h4>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
