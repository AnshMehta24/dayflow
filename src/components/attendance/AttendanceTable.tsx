"use client";

import { AttendanceRecord } from "@/types/attendance";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  showEmployeeName?: boolean;
}

export default function AttendanceTable({
  records,
  showEmployeeName = false,
}: AttendanceTableProps) {
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
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Check In
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Check Out
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Work Hours
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Total Hours
              </th>
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
                      {record.employeeName || "--"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {record.checkIn || "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {record.checkOut || "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {record.workHours.toFixed(2)}h
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {record.totalHours.toFixed(2)}h
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showEmployeeName ? 6 : 5}
                  className="px-4 py-8 text-center text-gray-600"
                >
                  No attendance records found
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
                      {record.employeeName || "--"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Check In:</span>
                  <span className="text-sm text-gray-900">
                    {record.checkIn || "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Check Out:</span>
                  <span className="text-sm text-gray-900">
                    {record.checkOut || "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Work Hours:</span>
                  <span className="text-sm text-gray-900">
                    {record.workHours.toFixed(2)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Total Hours:</span>
                  <span className="text-sm text-gray-900">
                    {record.totalHours.toFixed(2)}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-600">
            No attendance records found
          </div>
        )}
      </div>
    </div>
  );
}

