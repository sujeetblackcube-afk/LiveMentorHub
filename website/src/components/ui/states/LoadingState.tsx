import React from "react";

export function LoadingState({ message = "Loading LiveMentorHub data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p className="mt-4 text-sm font-semibold text-slate-300">{message}</p>
    </div>
  );
}
