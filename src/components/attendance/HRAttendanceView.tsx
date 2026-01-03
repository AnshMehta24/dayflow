// components/attendance/HRAttendanceView.tsx
"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import AttendanceSummary from "./AttendanceSummary";
import AttendanceTable from "./AttendanceTable";
import AttendanceTabs from "./AttendanceTabs";
import DateNavigator from "./DateNavigator";
import SearchBar from "./SearchBar";
import { toast } from "sonner";
import { checkIn, checkOut, getAllEmployeesAttendance, getAttendanceSummary, getCurrentCheckInStatus, getMyAttendance } from "@/app/(with navbar)/attendence/action";
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
  initialEmployeeAttendances: AttendanceRecord[];
  initialMonth: string;
  initialDate: string;
}

export default function HRAttendanceView({
  user,
  initialAttendances,
  initialSummary,
  initialCheckInStatus,
  initialEmployeeAttendances,
  initialMonth,
  initialDate,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [searchQuery, setSearchQuery] = useState("");

  const [myAttendances, setMyAttendances] = useState<AttendanceRecord[]>(initialAttendances);
  const [employeeAttendances, setEmployeeAttendances] = useState<AttendanceRecord[]>(
    initialEmployeeAttendances
  );
  const [summary, setSummary] = useState<AttendanceSummaryType | null>(initialSummary);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(initialCheckInStatus);

  const [isMyDataPending, startMyDataTransition] = useTransition();
  const [isEmployeeDataPending, startEmployeeDataTransition] = useTransition();
  const [isCheckingInOut, setIsCheckingInOut] = useState(false);
  
  // Track previous values to detect changes
  const prevMonthRef = useRef(selectedMonth);
  const prevDateRef = useRef(selectedDate);
  const activeTabRef = useRef<"my" | "employees">("my");
 
  const fetchMyAttendance = useCallback(async () => {
    startMyDataTransition(async () => {
      const [attendanceResult, summaryResult, statusResult] = await Promise.all([
        getMyAttendance(selectedMonth),
        getAttendanceSummary(user.id, selectedMonth),
        getCurrentCheckInStatus(),
      ]);

      if (attendanceResult.success) {
        setMyAttendances(attendanceResult.data || []);
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

  const fetchEmployeeAttendance = useCallback(async () => {
    startEmployeeDataTransition(async () => {
      const result = await getAllEmployeesAttendance(selectedDate);
      if (result.success) {
        setEmployeeAttendances(result.data || []);
      } else {
        toast.error(result.error);
      }
    });
  }, [selectedDate]);

  const handleTabChange = useCallback((activeTab: "my" | "employees") => {
    if (activeTab === "my" && activeTabRef.current !== "my") {
      fetchMyAttendance();
    }
    activeTabRef.current = activeTab;
  }, [fetchMyAttendance]);

  useEffect(() => {
    if (prevMonthRef.current !== selectedMonth) {
      prevMonthRef.current = selectedMonth;
      fetchMyAttendance();
    }
  }, [selectedMonth, fetchMyAttendance]);

  useEffect(() => {
    if (prevDateRef.current !== selectedDate) {
      prevDateRef.current = selectedDate;
      fetchEmployeeAttendance();
    }
  }, [selectedDate, fetchEmployeeAttendance]);

  const handleCheckIn = async () => {
    setIsCheckingInOut(true);
    try {
      const result = await checkIn();
      console.log(result);
      if (result.success) {
        toast.success(result.message || "Checked in successfully");
        await fetchMyAttendance();
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
        await fetchMyAttendance();
      } else {
        toast.error(result.error || "Failed to check out");
      }
    } finally {
      setIsCheckingInOut(false);
    }
  };

  const filteredEmployeeAttendances = employeeAttendances.filter((record) => {
    if (!searchQuery.trim()) return true;
    return record.employeeName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance Management</h1>

      <AttendanceTabs onTabChange={handleTabChange}>
        {(activeTab) => {
          if (activeTab === "my") {
            return (
              <>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    <label htmlFor="month-select" className="text-gray-600 text-sm sm:text-base">
                      Month:
                    </label>
                    <select
                      id="month-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="rounded border border-gray-300 bg-white px-3 sm:px-4 py-2 text-gray-900 text-sm sm:text-base focus:outline-none focus:border-gray-900"
                      disabled={isMyDataPending}
                    >
                      {generateMonthOptions()}
                    </select>
                  </div>

                  <CheckInOutButton
                    isCheckedIn={checkInStatus?.isCurrentlyCheckedIn || false}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                    loading={isCheckingInOut}
                  />
                </div>

                {isMyDataPending && (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
                  </div>
                )}

                {!isMyDataPending && summary && (
                  <AttendanceSummary summary={summary} />
                )}
                {!isMyDataPending && <AttendanceTable records={myAttendances} />}
              </>
            );
          } else {
            return (
              <>
                <div className="space-y-4">
                  <DateNavigator
                    currentDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>

                {isEmployeeDataPending && (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
                  </div>
                )}

                {!isEmployeeDataPending && (
                  <AttendanceTable
                    records={filteredEmployeeAttendances}
                    showEmployeeName={true}
                  />
                )}
              </>
            );
          }
        }}
      </AttendanceTabs>
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