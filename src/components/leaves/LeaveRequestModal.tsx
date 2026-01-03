"use client";

import { useState } from "react";
import { LeaveRequest } from "@/lib/mockLeaves";
import { calculateDays } from "@/lib/mockLeaves";

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<LeaveRequest, "id" | "status">) => void;
  currentUserName: string;
}

export default function LeaveRequestModal({
  isOpen,
  onClose,
  onSubmit,
  currentUserName,
}: LeaveRequestModalProps) {
  const [leaveType, setLeaveType] = useState<
    "Paid Time Off" | "Sick Leave" | "Unpaid Leave"
  >("Paid Time Off");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachment, setAttachment] = useState("");

  const allocation = startDate && endDate ? calculateDays(startDate, endDate) : 0;

  const handleSubmit = () => {
    onSubmit({
      employeeName: currentUserName,
      startDate,
      endDate,
      leaveType,
      attachment: attachment || undefined,
    });
    // Reset form
    setLeaveType("Paid Time Off");
    setStartDate("");
    setEndDate("");
    setAttachment("");
    onClose();
  };

  const handleDiscard = () => {
    setLeaveType("Paid Time Off");
    setStartDate("");
    setEndDate("");
    setAttachment("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded border border-gray-300 bg-white p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900">
          New Time Off Request
        </h2>

        <div className="space-y-4">
          {/* Employee Name (read-only) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Employee
            </label>
            <input
              type="text"
              value={currentUserName}
              readOnly
              className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600"
            />
          </div>

          {/* Time Off Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Time Off Type
            </label>
            <select
              value={leaveType}
              onChange={(e) =>
                setLeaveType(
                  e.target.value as "Paid Time Off" | "Sick Leave" | "Unpaid Leave"
                )
              }
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
            >
              <option value="Paid Time Off">Paid Time Off</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>

          {/* Allocation */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Allocation
            </label>
            <input
              type="text"
              value={`${allocation} days`}
              readOnly
              className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Attachment {leaveType === "Sick Leave" && "(Required)"}
            </label>
            <input
              type="text"
              value={attachment}
              onChange={(e) => setAttachment(e.target.value)}
              placeholder="File name (mock upload)"
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={handleDiscard}
            className="w-full sm:w-auto rounded border border-gray-300 bg-white px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-900 hover:bg-gray-50 focus:outline-none focus:border-gray-900"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto rounded border border-gray-900 bg-gray-900 px-4 sm:px-6 py-2 text-sm sm:text-base text-white hover:bg-gray-800"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

