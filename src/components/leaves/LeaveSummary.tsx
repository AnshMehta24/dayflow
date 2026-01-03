"use client";

import { LeaveSummary as LeaveSummaryType } from "@/lib/mockLeaves";

interface LeaveSummaryProps {
  summary: LeaveSummaryType;
}

export default function LeaveSummary({ summary }: LeaveSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded border border-neutral-700 bg-neutral-800 p-4">
        <div className="text-sm text-neutral-400">Paid Time Off</div>
        <div className="text-2xl font-bold">{summary.paidTimeOff} Days</div>
      </div>
      <div className="rounded border border-neutral-700 bg-neutral-800 p-4">
        <div className="text-sm text-neutral-400">Sick Leave</div>
        <div className="text-2xl font-bold">{summary.sickLeave} Days</div>
      </div>
    </div>
  );
}

