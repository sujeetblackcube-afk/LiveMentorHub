import React, { memo } from "react";

export const NoNetworkState = memo(function NoNetworkState({
  message = "No Internet Connection. Please check your network cables or Wi-Fi."
}) {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center gap-3 text-sm font-medium">
      <span className="text-xl">📡</span>
      <span>{message}</span>
    </div>
  );
});

export const SlowNetworkState = memo(function SlowNetworkState({
  message = "Slow Network Detected. Video playback speed and media loading may be delayed."
}) {
  return (
    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 flex items-center gap-3 text-xs font-medium">
      <span className="text-lg">🐢</span>
      <span>{message}</span>
    </div>
  );
});

export default NoNetworkState;
