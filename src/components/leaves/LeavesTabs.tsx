"use client";

import { ReactNode, useState } from "react";

interface LeavesTabsProps {
  children: (activeTab: "requests" | "allocation") => ReactNode;
}

export default function LeavesTabs({ children }: LeavesTabsProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "allocation">("requests");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 sm:gap-4 border-b border-gray-300 overflow-x-auto">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
            activeTab === "requests"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Time Off Requests
        </button>
        <button
          onClick={() => setActiveTab("allocation")}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
            activeTab === "allocation"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Allocation
        </button>
      </div>

      {/* Tab Content */}
      {children(activeTab)}
    </div>
  );
}

