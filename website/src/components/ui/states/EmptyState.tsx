import React from "react";

export function EmptyState({
  title = "No Data Found",
  message = "There are no records available at the moment.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
      <span className="text-4xl">🔍</span>
      <h3 className="mt-3 text-lg font-bold text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-md">{message}</p>
    </div>
  );
}
