import React from "react";

export function ErrorState({
  title = "Something went wrong",
  message = "Failed to load requested information. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center">
      <span className="text-4xl">⚠️</span>
      <h3 className="mt-3 text-lg font-bold text-red-400">{title}</h3>
      <p className="mt-1 text-sm text-slate-300 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-500 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
