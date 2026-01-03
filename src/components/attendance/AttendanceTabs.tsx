"use client";

import { ReactNode, useState, useEffect } from "react";

interface AttendanceTabsProps {
  children: (activeTab: "my" | "employees") => ReactNode;
  onTabChange?: (activeTab: "my" | "employees") => void;
}

export default function AttendanceTabs({ children, onTabChange }: AttendanceTabsProps) {
  const [activeTab, setActiveTab] = useState<"my" | "employees">("my");

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 sm:gap-4 border-b border-gray-300 overflow-x-auto">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
            activeTab === "my"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Attendance
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
            activeTab === "employees"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Employee Attendance
        </button>
      </div>

      {/* Tab Content */}
      {children(activeTab)}
    </div>
  );
}

