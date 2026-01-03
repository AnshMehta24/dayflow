"use client";

import { LeaveRequest } from "@/lib/mockLeaves";
import { formatDate } from "@/lib/mockLeaves";

interface LeaveTableProps {
  records: LeaveRequest[];
  showEmployeeName?: boolean;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function LeaveTable({
  records,
  showEmployeeName = false,
  showActions = false,
  onApprove,
  onReject,
}: LeaveTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-400";
      case "Rejected":
        return "text-red-400";
      case "Pending":
      default:
        return "text-neutral-400";
    }
  };

  return (
    <div className="rounded border border-neutral-700 bg-neutral-800">
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-neutral-800 z-10">
            <tr className="border-b border-neutral-700">
              {showEmployeeName && (
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                  Employee Name
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                Time Off Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                Status
              </th>
              {showActions && (
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-neutral-700 last:border-b-0"
                >
                  {showEmployeeName && (
                    <td className="px-4 py-3 text-neutral-200">
                      {record.employeeName}
                    </td>
                  )}
                  <td className="px-4 py-3 text-neutral-200">
                    {formatDate(record.startDate)}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {formatDate(record.endDate)}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {record.leaveType}
                  </td>
                  <td className="px-4 py-3">
                    <span className={getStatusColor(record.status)}>
                      {record.status}
                    </span>
                  </td>
                  {showActions && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprove?.(record.id)}
                          className="rounded border border-green-600 bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject?.(record.id)}
                          className="rounded border border-red-600 bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showEmployeeName ? (showActions ? 6 : 5) : showActions ? 5 : 4}
                  className="px-4 py-8 text-center text-neutral-400"
                >
                  No time off requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

