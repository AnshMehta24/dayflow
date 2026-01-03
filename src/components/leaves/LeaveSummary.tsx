"use client";

import { LeaveSummary as LeaveSummaryType } from "@/lib/mockLeaves";

interface LeaveSummaryProps {
  summary: LeaveSummaryType;
}

export default function LeaveSummary({ summary }: LeaveSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div className="rounded border border-gray-300 bg-white p-3 sm:p-4">
        <div className="text-xs sm:text-sm text-gray-600">Paid Time Off</div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.paidTimeOff} Days</div>
      </div>
      <div className="rounded border border-gray-300 bg-white p-3 sm:p-4">
        <div className="text-xs sm:text-sm text-gray-600">Sick Leave</div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.sickLeave} Days</div>
      </div>
    </div>
  );
}

