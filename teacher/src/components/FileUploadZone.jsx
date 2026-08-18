import React, { useState, memo } from "react";
import { UploadCloud, FileText, Video, Image as ImageIcon, CheckCircle2, Loader2, X, FileSpreadsheet } from "lucide-react";
import { toast } from "react-toastify";

export const FileUploadZone = memo(({
  label = "Upload File",
  accept = "application/pdf,video/*,image/*",
  onFileSelect,
  currentUrl,
  fileName: defaultFileName,
  maxSizeMB = 50,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileDetails, setFileDetails] = useState(null);

  const getFileTypeIcon = (name = "", type = "") => {
    if (type.includes("pdf") || name.endsWith(".pdf")) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes("video") || name.endsWith(".mp4") || name.endsWith(".webm")) return <Video className="w-8 h-8 text-indigo-500" />;
    if (type.includes("sheet") || name.endsWith(".xlsx") || name.endsWith(".csv")) return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
    return <ImageIcon className="w-8 h-8 text-amber-500" />;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name}...`);
    setIsUploading(true);
    setProgress(10);
    setFileDetails({
      name: file.name,
      size: formatBytes(file.size),
      type: file.type,
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsUploading(false);
      toast.update(toastId, {
        render: `${file.name} uploaded successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (onFileSelect) {
        onFileSelect(file);
      }
    }, 800);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFileDetails(null);
    setProgress(0);
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">{label}</label>}

      <div className="relative group border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 rounded-xl p-4 transition-all text-center cursor-pointer overflow-hidden">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {isUploading ? (
          <div className="py-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span className="text-sm font-semibold text-slate-700">Uploading {fileDetails?.name}...</span>
            </div>
            <div className="w-full max-w-xs bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">{progress}% completed ({fileDetails?.size})</span>
          </div>
        ) : fileDetails || currentUrl || defaultFileName ? (
          <div className="flex items-center justify-between py-1 px-2">
            <div className="flex items-center gap-3">
              {getFileTypeIcon(fileDetails?.name || defaultFileName || currentUrl, fileDetails?.type || "")}
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                  {fileDetails?.name || defaultFileName || "Uploaded File"}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
                  <span>Ready ({fileDetails?.size || "Uploaded"})</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors z-20"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Click or drag file to upload
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports PDF, MP4, PNG, JPG (Max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

FileUploadZone.displayName = "FileUploadZone";
