"use client";

import { useState, useEffect, useTransition, useCallback } from "react";

import AttendanceSummary from "./AttendanceSummary";
import AttendanceTable from "./AttendanceTable";
import { toast } from "sonner";
import { checkIn, checkOut, getAttendanceSummary, getCurrentCheckInStatus, getMyAttendance } from "@/app/(with navbar)/attendence/action";
import CheckInOutButton from "./CheckInOutButton";
import type { AttendanceRecord, AttendanceSummary as AttendanceSummaryType } from "@/types/attendance";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CheckInStatus {
  hasCheckedIn: boolean;
  isCurrentlyCheckedIn: boolean;
  lastEntry: unknown;
  totalHours: number;
}

interface Props {
  user: User;
  initialAttendances: AttendanceRecord[];
  initialSummary: AttendanceSummaryType | null;
  initialCheckInStatus: CheckInStatus | null;
  initialMonth: string;
}

export default function EmployeeAttendanceView({
  user,
  initialAttendances,
  initialSummary,
  initialCheckInStatus,
  initialMonth,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(initialAttendances);
  const [summary, setSummary] = useState<AttendanceSummaryType | null>(initialSummary);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(initialCheckInStatus);
  const [isPending, startTransition] = useTransition();
  const [isCheckingInOut, setIsCheckingInOut] = useState(false);

  const fetchData = useCallback(async () => {
    startTransition(async () => {
      const [attendanceResult, summaryResult, statusResult] = await Promise.all([
        getMyAttendance(selectedMonth),
        getAttendanceSummary(user.id, selectedMonth),
        getCurrentCheckInStatus(),
      ]);

      if (attendanceResult.success) {
        setAttendances(attendanceResult.data || []);
      } else {
        toast.error(attendanceResult.error);
      }

      if (summaryResult.success) {
        setSummary(summaryResult.data || null);
      } else {
        toast.error(summaryResult.error);
      }

      if (statusResult.success) {
        setCheckInStatus(statusResult.data || null);
      } else {
        toast.error(statusResult.error);
      }
    });
  }, [selectedMonth, user.id]);

  useEffect(() => {
    if (selectedMonth !== initialMonth) {
      fetchData();
    }
  }, [selectedMonth, initialMonth, fetchData]);

  const handleCheckIn = async () => {
    setIsCheckingInOut(true);
    try {
      const result = await checkIn();
      if (result.success) {
        toast.success(result.message || "Checked in successfully");
        await fetchData();
      } else {
        toast.error(result.error || "Failed to check in");
      }
    } finally {
      setIsCheckingInOut(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingInOut(true);
    try {
      const result = await checkOut();
      if (result.success) {
        toast.success(result.message || "Checked out successfully");
        await fetchData();
      } else {
        toast.error(result.error || "Failed to check out");
      }
    } finally {
      setIsCheckingInOut(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Attendance</h1>

        <CheckInOutButton
          isCheckedIn={checkInStatus?.isCurrentlyCheckedIn || false}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          loading={isCheckingInOut}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <label htmlFor="month-select" className="text-gray-600 text-sm sm:text-base">
          Month:
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 sm:px-4 py-2 text-gray-900 text-sm sm:text-base focus:outline-none focus:border-gray-900"
          disabled={isPending}
        >
          {generateMonthOptions()}
        </select>
      </div>

      {isPending && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
        </div>
      )}

      {!isPending && summary && <AttendanceSummary summary={summary} />}

      {!isPending && <AttendanceTable records={attendances} />}
    </div>
  );
}

function generateMonthOptions() {
  const options = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    options.push(
      <option key={value} value={value}>
        {label}
      </option>
    );
  }

  return options;
}

