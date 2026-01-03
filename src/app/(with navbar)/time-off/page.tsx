"use client";

import { useState, useMemo } from "react";
import { CURRENT_ROLE } from "@/lib/mockAttendance";
import {
  mockMyLeaveRequests,
  mockAllLeaveRequests,
  mockLeaveSummary,
  LeaveRequest,
} from "@/lib/mockLeaves";
import LeaveSummary from "@/components/leaves/LeaveSummary";
import LeaveTable from "@/components/leaves/LeaveTable";
import LeaveRequestModal from "@/components/leaves/LeaveRequestModal";
import LeavesTabs from "@/components/leaves/LeavesTabs";
import SearchBar from "@/components/leaves/SearchBar";

const CURRENT_USER_NAME = "John Doe";

export default function TimeOffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
    CURRENT_ROLE === "EMPLOYEE" ? mockMyLeaveRequests : mockAllLeaveRequests
  );

  // Filter leave requests by search query (HR only)
  const filteredLeaveRequests = useMemo(() => {
    if (CURRENT_ROLE === "EMPLOYEE") {
      return leaveRequests;
    }

    if (!searchQuery.trim()) {
      return leaveRequests;
    }

    return leaveRequests.filter((request) =>
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaveRequests, searchQuery]);

  const handleSubmitRequest = (request: Omit<LeaveRequest, "id" | "status">) => {
    const newRequest: LeaveRequest = {
      id: String(Date.now()),
      ...request,
      status: "Pending",
    };
    setLeaveRequests([...leaveRequests, newRequest]);
  };

  const handleApprove = (id: string) => {
    setLeaveRequests(
      leaveRequests.map((request) =>
        request.id === id ? { ...request, status: "Approved" as const } : request
      )
    );
  };

  const handleReject = (id: string) => {
    setLeaveRequests(
      leaveRequests.map((request) =>
        request.id === id ? { ...request, status: "Rejected" as const } : request
      )
    );
  };

  // Employee View
  if (CURRENT_ROLE === "EMPLOYEE") {
    return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Time Off</h1>

          {/* Summary Cards */}
          <LeaveSummary summary={mockLeaveSummary} />

          {/* New Time Off Button */}
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded border border-neutral-600 bg-neutral-600 px-6 py-2 text-neutral-200 hover:bg-neutral-500"
            >
              NEW
            </button>
          </div>

          {/* Leave Requests Table */}
          <LeaveTable records={filteredLeaveRequests} />

          {/* Modal */}
          <LeaveRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmitRequest}
            currentUserName={CURRENT_USER_NAME}
          />
        </div>
    );
  }

  // HR View
  return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Time Off</h1>

        <LeavesTabs>
          {(activeTab) => {
            if (activeTab === "requests") {
              return (
                <>
                  {/* Summary Cards */}
                  <LeaveSummary summary={mockLeaveSummary} />

                  {/* Search Bar */}
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />

                  {/* Leave Requests Table with Actions */}
                  <LeaveTable
                    records={filteredLeaveRequests}
                    showEmployeeName={true}
                    showActions={true}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </>
              );
            } else {
              // Allocation Tab (Placeholder)
              return (
                <div className="rounded border border-neutral-700 bg-neutral-800 p-8 text-center text-neutral-400">
                  Leave allocation management coming soon
                </div>
              );
            }
          }}
        </LeavesTabs>
      </div>
  );
}

