"use client";

import { AttendanceRecord, getAttendanceSummary } from "@/lib/mockAttendance";

interface AttendanceSummaryProps {
  records: AttendanceRecord[];
}

export default function AttendanceSummary({ records }: AttendanceSummaryProps) {
  const summary = getAttendanceSummary(records);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded border border-neutral-700 bg-neutral-800 p-4">
        <div className="text-sm text-neutral-400">Days Present</div>
        <div className="text-2xl font-bold">{summary.daysPresent}</div>
      </div>
      <div className="rounded border border-neutral-700 bg-neutral-800 p-4">
        <div className="text-sm text-neutral-400">Leaves Count</div>
        <div className="text-2xl font-bold">{summary.leavesCount}</div>
      </div>
      <div className="rounded border border-neutral-700 bg-neutral-800 p-4">
        <div className="text-sm text-neutral-400">Total Working Days</div>
        <div className="text-2xl font-bold">{summary.totalWorkingDays}</div>
      </div>
    </div>
  );
}

