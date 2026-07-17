import React from "react";
import { theme } from "../theme";

export default function Classes() {
  return (
    <div
      className="p-4 sm:p-6"
      style={{ backgroundColor: theme.colors.secondary, minHeight: "100vh" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: theme.colors.textPrimary }}
        >
          Manage Classes
        </h1>
      </div>
      
      <div
        className="p-8 rounded-lg shadow-md text-center"
        style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.primary }}>Classes Section Coming Soon</h2>
        <p style={{ color: theme.colors.textSecondary }}>
          This is a static placeholder page. Soon, you will be able to manage, add, and organize your classes from here!
        </p>
      </div>
    </div>
  );
}
