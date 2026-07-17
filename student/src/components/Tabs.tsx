"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  variant?: "default" | "underline";
}

export default function Tabs({ tabs, activeTab, onTabChange, variant = "default" }: TabsProps) {
  if (variant === "underline") {
    return (
      <div className="flex w-full border-b border-gray-200 bg-white">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ backgroundColor: "var(--accent-blue)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-100 text-[#3a90f8]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {isActive && <Check className="h-4 w-4" />}
            {tab}
          </button>
        );
      })}
    </div>
  );
}
