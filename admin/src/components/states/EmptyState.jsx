import React, { memo } from "react";

export const EmptyState = memo(function EmptyState({
  title = "No Data Found",
  description = "There are no records available to display right now.",
  actionText,
  onAction
}) {
  return (
    <div className="p-12 text-center bg-gray-50 border border-gray-200 rounded-xl">
      <div className="text-4xl mb-3">📂</div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
});

export default EmptyState;
