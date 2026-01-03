"use client";

import { AttendanceRecord } from "@/lib/mockAttendance";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  showEmployeeName?: boolean;
}

export default function AttendanceTable({
  records,
  showEmployeeName = false,
}: AttendanceTableProps) {
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
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                Check In
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                Check Out
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                Work Hours
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-200">
                Extra Hours
              </th>
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
                      {record.employeeName || "--"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-neutral-200">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {record.checkIn || "--"}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {record.checkOut || "--"}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {record.workHours.toFixed(2)}h
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {record.extraHours > 0
                      ? `${record.extraHours.toFixed(2)}h`
                      : "--"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showEmployeeName ? 6 : 5}
                  className="px-4 py-8 text-center text-neutral-400"
                >
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

