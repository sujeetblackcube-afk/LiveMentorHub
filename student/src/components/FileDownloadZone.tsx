"use client";

import React, { useState, memo } from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface FileDownloadZoneProps {
  title?: string;
  fileName?: string;
  fileType?: "pdf" | "excel" | "doc";
  onDownload?: () => Promise<void> | void;
  variant?: "button" | "card";
}

export const FileDownloadZone = memo(({
  title = "Download Resource",
  fileName = "document.pdf",
  fileType = "pdf",
  onDownload,
  variant = "button",
}: FileDownloadZoneProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async () => {
    if (isDownloading) return;
    const toastId = toast.loading(`Preparing ${fileName} for download...`);
    setIsDownloading(true);

    try {
      if (onDownload) {
        await onDownload();
      }
      toast.update(toastId, {
        render: `${fileName} downloaded successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err: any) {
      toast.update(toastId, {
        render: err?.message || "Failed to download file.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getIcon = () => {
    if (fileType === "excel" || fileName.endsWith(".xlsx") || fileName.endsWith(".csv")) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    return <FileText className="w-5 h-5 text-red-600" />;
  };

  if (variant === "card") {
    return (
      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
            {getIcon()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="text-xs text-slate-500">{fileName}</p>
          </div>
        </div>
        <button
          onClick={handleDownloadClick}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownloadClick}
      disabled={isDownloading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 text-indigo-600" />
          <span>{title}</span>
        </>
      )}
    </button>
  );
});

FileDownloadZone.displayName = "FileDownloadZone";
