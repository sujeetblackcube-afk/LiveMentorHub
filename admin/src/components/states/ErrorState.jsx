import React, { memo } from "react";

export const ErrorState = memo(function ErrorState({
  title = "Something Went Wrong",
  message = "Unable to process request. Please try again.",
  onRetry
}) {
  return (
    <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl text-red-700">
      <div className="text-3xl mb-2">⚠️</div>
      <h4 className="text-base font-bold text-red-600 mb-1">{title}</h4>
      <p className="text-sm text-red-500 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Retry Request
        </button>
      )}
    </div>
  );
});

export default ErrorState;
