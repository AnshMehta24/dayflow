"use client";

import { useState, useMemo } from "react";
import {
  CURRENT_ROLE,
  mockMyAttendance,
  mockEmployeeAttendance,
} from "@/lib/mockAttendance";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import AttendanceTabs from "@/components/attendance/AttendanceTabs";
import DateNavigator from "@/components/attendance/DateNavigator";
import SearchBar from "@/components/attendance/SearchBar";

export default function AttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [selectedDate, setSelectedDate] = useState("2024-01-01");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter employee attendance by date and search query
  const filteredEmployeeAttendance = useMemo(() => {
    let filtered = mockEmployeeAttendance.filter(
      (record) => record.date === selectedDate
    );

    if (searchQuery.trim()) {
      filtered = filtered.filter((record) =>
        record.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedDate, searchQuery]);

  // Employee View
  if (CURRENT_ROLE === "EMPLOYEE") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Attendance</h1>

        {/* Month Selector */}
        <div className="flex items-center gap-4">
          <label htmlFor="month-select" className="text-neutral-200">
            Month:
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200"
          >
            <option value="2024-01">January 2024</option>
            <option value="2024-02">February 2024</option>
            <option value="2024-03">March 2024</option>
          </select>
        </div>

        {/* Summary Cards */}
        <AttendanceSummary records={mockMyAttendance} />

        {/* Attendance Table */}
        <AttendanceTable records={mockMyAttendance} />
      </div>
    );
  }

  // HR View
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>

      <AttendanceTabs>
        {(activeTab) => {
          if (activeTab === "my") {
            // My Attendance Tab (same as Employee view)
            return (
              <>
                {/* Month Selector */}
                <div className="flex items-center gap-4">
                  <label htmlFor="month-select" className="text-neutral-200">
                    Month:
                  </label>
                  <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200"
                  >
                    <option value="2024-01">January 2024</option>
                    <option value="2024-02">February 2024</option>
                    <option value="2024-03">March 2024</option>
                  </select>
                </div>

                {/* Summary Cards */}
                <AttendanceSummary records={mockMyAttendance} />

                {/* Attendance Table */}
                <AttendanceTable records={mockMyAttendance} />
              </>
            );
          } else {
            // Employee Attendance Tab
            return (
              <>
                {/* Date Navigation and Search */}
                <div className="space-y-4">
                  <DateNavigator
                    currentDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>

                {/* Attendance Table with Employee Names */}
                <AttendanceTable
                  records={filteredEmployeeAttendance}
                  showEmployeeName={true}
                />
              </>
            );
          }
        }}
      </AttendanceTabs>
    </div>
  );
}
