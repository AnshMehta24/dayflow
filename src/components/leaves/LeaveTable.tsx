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
        return "text-green-600";
      case "Rejected":
        return "text-red-600";
      case "Pending":
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="rounded border border-gray-300 bg-white">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-gray-300">
              {showEmployeeName && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Employee Name
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Time Off Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Status
              </th>
              {showActions && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
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
                  className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50"
                >
                  {showEmployeeName && (
                    <td className="px-4 py-3 text-gray-900">
                      {record.employeeName}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-900">
                    {formatDate(record.startDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatDate(record.endDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
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
                  className="px-4 py-8 text-center text-gray-600"
                >
                  No time off requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden max-h-96 overflow-y-auto">
        {records.length > 0 ? (
          <div className="divide-y divide-gray-300">
            {records.map((record) => (
              <div key={record.id} className="p-4 space-y-2">
                {showEmployeeName && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Employee:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {record.employeeName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Start Date:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(record.startDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">End Date:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(record.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Type:</span>
                  <span className="text-sm text-gray-900">
                    {record.leaveType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Status:</span>
                  <span className={`text-sm ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                {showActions && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onApprove?.(record.id)}
                      className="flex-1 rounded border border-green-600 bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject?.(record.id)}
                      className="flex-1 rounded border border-red-600 bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-600">
            No time off requests found
          </div>
        )}
      </div>
    </div>
  );
}

