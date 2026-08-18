import React, { memo } from "react";

export const LoadingState = memo(function LoadingState({ message = "Loading data, please wait..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-semibold text-gray-500">{message}</p>
    </div>
  );
});

export default LoadingState;
