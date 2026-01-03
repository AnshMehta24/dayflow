"use client";

import { ReactNode, useState } from "react";

interface LeavesTabsProps {
  children: (activeTab: "requests" | "allocation") => ReactNode;
}

export default function LeavesTabs({ children }: LeavesTabsProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "allocation">("requests");

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-neutral-700">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 font-medium ${
            activeTab === "requests"
              ? "border-b-2 border-neutral-200 text-neutral-200"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Time Off Requests
        </button>
        <button
          onClick={() => setActiveTab("allocation")}
          className={`px-4 py-2 font-medium ${
            activeTab === "allocation"
              ? "border-b-2 border-neutral-200 text-neutral-200"
              : "text-neutral-400 hover:text-neutral-200"
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

