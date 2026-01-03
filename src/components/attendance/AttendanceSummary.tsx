"use client";

import type { AttendanceSummary as AttendanceSummaryType } from "@/types/attendance";

interface AttendanceSummaryProps {
  summary: AttendanceSummaryType;
}

export default function AttendanceSummary({ summary }: AttendanceSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div className="rounded border border-gray-300 bg-white p-3 sm:p-4">
        <div className="text-xs sm:text-sm text-gray-600">Days Present</div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.present}</div>
      </div>
      <div className="rounded border border-gray-300 bg-white p-3 sm:p-4">
        <div className="text-xs sm:text-sm text-gray-600">Leaves Count</div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.leave}</div>
      </div>
      <div className="rounded border border-gray-300 bg-white p-3 sm:p-4">
        <div className="text-xs sm:text-sm text-gray-600">Total Working Days</div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{summary.totalDays}</div>
      </div>
    </div>
  );
}

