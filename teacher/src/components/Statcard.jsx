import React from 'react';
import { theme } from '../theme';

export default function StatCard({ title, value, change, positive, onClick }) {
  return (
    <div
      className={`p-4 sm:p-6 rounded-xl shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
      }`}
      style={{ backgroundColor: theme.colors.card }}
      onClick={onClick}
    >
      <h4
        className="text-sm sm:text-base font-medium mb-2"
        style={{ color: theme.colors.textSecondary }}
      >
        {title}
      </h4>
      <div className="flex items-center justify-between">
        <span
          className="text-xl sm:text-2xl lg:text-3xl font-bold"
          style={{ color: theme.colors.textPrimary }}
        >
          {value}
        </span>
        {change && (
          <span
            className={`text-xs sm:text-sm font-medium ${
              positive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
