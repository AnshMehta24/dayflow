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

  if (CURRENT_ROLE === "EMPLOYEE") {
    return (
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Time Off</h1>

          <LeaveSummary summary={mockLeaveSummary} />

          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto rounded border border-gray-900 bg-gray-900 px-4 sm:px-6 py-2 text-sm sm:text-base text-white hover:bg-gray-800"
            >
              NEW
            </button>
          </div>

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

  return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold">Time Off</h1>

        <LeavesTabs>
          {(activeTab) => {
            if (activeTab === "requests") {
              return (
                <>
                  <LeaveSummary summary={mockLeaveSummary} />

                  <SearchBar value={searchQuery} onChange={setSearchQuery} />

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
              return (
                <div className="rounded border border-gray-300 bg-white p-8 text-center text-gray-600">
                  Leave allocation management coming soon
                </div>
              );
            }
          }}
        </LeavesTabs>
      </div>
  );
}

