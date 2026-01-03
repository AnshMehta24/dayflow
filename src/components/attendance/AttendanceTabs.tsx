"use client";

import { ReactNode, useState } from "react";

interface AttendanceTabsProps {
  children: (activeTab: "my" | "employees") => ReactNode;
}

export default function AttendanceTabs({ children }: AttendanceTabsProps) {
  const [activeTab, setActiveTab] = useState<"my" | "employees">("my");

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-neutral-700">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 font-medium ${
            activeTab === "my"
              ? "border-b-2 border-neutral-200 text-neutral-200"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          My Attendance
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-4 py-2 font-medium ${
            activeTab === "employees"
              ? "border-b-2 border-neutral-200 text-neutral-200"
              : "text-neutral-400 hover:text-neutral-200"
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

