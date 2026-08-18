import React, { memo } from "react";
import { Loader2 } from "lucide-react";

export const LoadingState = memo(({ message = "Loading content..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-slate-500">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
    <p className="text-sm font-medium">{message}</p>
  </div>
));
LoadingState.displayName = "LoadingState";

export const EmptyState = memo(({ title = "No data found", description = "There are no records to display right now." }: { title?: string; description?: string }) => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
      📁
    </div>
    <h4 className="text-base font-semibold text-slate-700 mb-1">{title}</h4>
    <p className="text-sm text-slate-500 max-w-sm">{description}</p>
  </div>
));
EmptyState.displayName = "EmptyState";

export const ErrorState = memo(({ title = "Something went wrong", message = "Unable to load data.", onRetry }: { title?: string; message?: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-center border border-red-200 rounded-xl bg-red-50/30">
    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 font-bold">
      !
    </div>
    <h4 className="text-base font-semibold text-red-800 mb-1">{title}</h4>
    <p className="text-sm text-red-600 mb-4 max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-xs"
      >
        Try Again
      </button>
    )}
  </div>
));
ErrorState.displayName = "ErrorState";

export const NoNetworkState = memo(() => (
  <div className="bg-red-600 text-white px-4 py-2.5 text-center text-xs font-semibold fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 shadow-md">
    <span>⚠️ You are currently offline. Please check your internet connection.</span>
  </div>
));
NoNetworkState.displayName = "NoNetworkState";

export const SlowNetworkState = memo(() => (
  <div className="bg-amber-500 text-white px-4 py-2 text-center text-xs font-semibold fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 shadow-md">
    <span>🐢 Slow network connection detected. Loading may take longer than usual.</span>
  </div>
));
SlowNetworkState.displayName = "SlowNetworkState";
