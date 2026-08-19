import React from "react";

export function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-950 text-slate-100 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Legal Policy</span>
          <h1 className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="prose prose-invert mt-8 max-w-none text-sm leading-relaxed text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}
