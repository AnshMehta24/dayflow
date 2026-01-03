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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded border border-neutral-700 bg-neutral-800 p-6">
        <h2 className="mb-6 text-2xl font-bold text-neutral-200">
          New Time Off Request
        </h2>

        <div className="space-y-4">
          {/* Employee Name (read-only) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-200">
              Employee
            </label>
            <input
              type="text"
              value={currentUserName}
              readOnly
              className="w-full rounded border border-neutral-700 bg-neutral-700 px-4 py-2 text-neutral-400"
            />
          </div>

          {/* Time Off Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-200">
              Time Off Type
            </label>
            <select
              value={leaveType}
              onChange={(e) =>
                setLeaveType(
                  e.target.value as "Paid Time Off" | "Sick Leave" | "Unpaid Leave"
                )
              }
              className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200"
            >
              <option value="Paid Time Off">Paid Time Off</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200"
              />
            </div>
          </div>

          {/* Allocation */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-200">
              Allocation
            </label>
            <input
              type="text"
              value={`${allocation} days`}
              readOnly
              className="w-full rounded border border-neutral-700 bg-neutral-700 px-4 py-2 text-neutral-400"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-200">
              Attachment {leaveType === "Sick Leave" && "(Required)"}
            </label>
            <input
              type="text"
              value={attachment}
              onChange={(e) => setAttachment(e.target.value)}
              placeholder="File name (mock upload)"
              className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200 placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleDiscard}
            className="rounded border border-neutral-700 bg-neutral-800 px-6 py-2 text-neutral-200 hover:bg-neutral-700"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="rounded border border-neutral-600 bg-neutral-600 px-6 py-2 text-neutral-200 hover:bg-neutral-500"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

