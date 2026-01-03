"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  getLeaveLedgers,
  getEmployees,
  addLeaveLedgerEntry,
  getLeaveBalance,
} from "@/app/(with navbar)/time-off/action";
import type { LeaveType } from "@/types/leave";

interface Employee {
  id: string;
  name: string;
  email: string;
  loginId: string | null;
}

interface LeaveLedgerEntry {
  id: string;
  userId: string;
  leaveType: LeaveType;
  change: number;
  reason: "ACCRUAL" | "LEAVE_APPROVED" | "MANUAL_ADJUSTMENT";
  referenceId: string | null;
  createdAt: string;
  user: Employee;
}

interface EmployeeBalance {
  employee: Employee;
  balances: Record<LeaveType, number>;
}

export default function LeaveAllocation() {
  const [ledgerEntries, setLedgerEntries] = useState<LeaveLedgerEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeBalances, setEmployeeBalances] = useState<EmployeeBalance[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showLedgerHistory, setShowLedgerHistory] = useState(false);

  const [ledgerForm, setLedgerForm] = useState({
    leaveType: "PAID" as LeaveType,
    change: 0,
    reason: "ACCRUAL" as "ACCRUAL" | "MANUAL_ADJUSTMENT",
  });

  const fetchData = useCallback(async () => {
    startTransition(async () => {
      const [employeesResult, ledgerResult] = await Promise.all([
        getEmployees(),
        getLeaveLedgers(),
      ]);

      if (employeesResult.success) {
        const employeesData = employeesResult.data || [];
        setEmployees(employeesData);

        const balancePromises = employeesData.map(async (employee) => {
          const balanceResult = await getLeaveBalance(employee.id);
          if (balanceResult.success) {
            return {
              employee,
              balances: balanceResult.data as Record<LeaveType, number>,
            };
          }
          return {
            employee,
            balances: { PAID: 0, SICK: 0, EXTRA: 0 },
          };
        });

        const balances = await Promise.all(balancePromises);
        setEmployeeBalances(balances);
      } else {
        toast.error(employeesResult.error || "Failed to fetch employees");
      }

      if (ledgerResult.success) {
        setLedgerEntries(ledgerResult.data || []);
      } else {
        toast.error(ledgerResult.error || "Failed to fetch ledger entries");
      }
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployeeIds(employees.map((emp) => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const handleEmployeeSelect = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployeeIds((prev) => prev.filter((id) => id !== employeeId));
      setSelectAll(false);
    }
  };

  const handleAddLedgerEntry = async () => {
    if (selectedEmployeeIds.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    if (ledgerForm.change === 0) {
      toast.error("Change must be non-zero");
      return;
    }

    setIsAdding(true);
    try {
      const result = await addLeaveLedgerEntry({
        userIds: selectedEmployeeIds,
        leaveType: ledgerForm.leaveType,
        change: ledgerForm.change,
        reason: ledgerForm.reason,
      });

      if (result.success) {
        toast.success(result.message || "Leaves added successfully");
        setSelectedEmployeeIds([]);
        setSelectAll(false);
        setLedgerForm({ leaveType: "PAID", change: 0, reason: "ACCRUAL" });
        await fetchData();
      } else {
        toast.error(result.error || "Failed to add leaves");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error adding leaves:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const getBalance = (userId: string, leaveType: LeaveType): number => {
    const balance = employeeBalances.find((b) => b.employee.id === userId);
    return balance?.balances[leaveType] || 0;
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Leave Allocation Management</h2>
        <button
          onClick={() => setShowLedgerHistory(!showLedgerHistory)}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
        >
          {showLedgerHistory ? "Hide" : "Show"} Leaves History
        </button>
      </div>

      <div className="rounded border border-gray-300 bg-white p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Leaves</h3>
        <p className="mb-4 text-sm text-gray-600">
          Use this to allocate leave (positive values), make adjustments, or record accruals. Leave
          deductions are automatically created when leave requests are approved.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={ledgerForm.reason}
              onChange={(e) =>
                setLedgerForm((prev) => ({
                  ...prev,
                  reason: e.target.value as "ACCRUAL" | "MANUAL_ADJUSTMENT",
                }))
              }
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
            >
              <option value="ACCRUAL">Accrual (Monthly/Yearly allocation)</option>
              <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              value={ledgerForm.leaveType}
              onChange={(e) =>
                setLedgerForm((prev) => ({
                  ...prev,
                  leaveType: e.target.value as LeaveType,
                }))
              }
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
            >
              <option value="PAID">Paid Time Off</option>
              <option value="SICK">Sick Leave</option>
              <option value="EXTRA">Extra Leave</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Change (Days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={ledgerForm.change}
              onChange={(e) =>
                setLedgerForm((prev) => ({
                  ...prev,
                  change: Number(e.target.value),
                }))
              }
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
              placeholder="Enter positive or negative number (e.g., +5, -2)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Positive values add days, negative values deduct days
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Select Employees <span className="text-red-500">*</span>
            </label>
            <div className="max-h-60 overflow-y-auto rounded border border-gray-300 bg-white">
              {employees.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No employees found</div>
              ) : (
                <>
                  <div className="border-b border-gray-200 p-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="font-medium text-gray-900">Select All</span>
                    </label>
                  </div>
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="border-b border-gray-200 p-3 last:border-b-0"
                    >
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedEmployeeIds.includes(employee.id)}
                          onChange={(e) =>
                            handleEmployeeSelect(employee.id, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-gray-900">{employee.name}</span>
                        {employee.loginId && (
                          <span className="text-sm text-gray-500">({employee.loginId})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </>
              )}
            </div>
            {selectedEmployeeIds.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {selectedEmployeeIds.length} employee(s) selected
              </p>
            )}
          </div>

          <button
            onClick={handleAddLedgerEntry}
            disabled={isAdding || selectedEmployeeIds.length === 0 || ledgerForm.change === 0}
            className="w-full sm:w-auto rounded border border-gray-900 bg-gray-900 px-4 sm:px-6 py-2 text-sm sm:text-base text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add Leaves"}
          </button>
        </div>
      </div>

      <div className="rounded border border-gray-300 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Paid Time Off
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Sick Leave
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Extra Leave
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => {
                  const balance = getBalance(employee.id, "PAID");
                  const sickBalance = getBalance(employee.id, "SICK");
                  const extraBalance = getBalance(employee.id, "EXTRA");
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          {employee.loginId && (
                            <div className="text-xs text-gray-500">{employee.loginId}</div>
                          )}
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 text-sm ${
                          balance >= 0 ? "text-gray-900" : "text-red-600"
                        }`}
                      >
                        {balance} days
                      </td>
                      <td
                        className={`px-4 py-3 text-sm ${
                          sickBalance >= 0 ? "text-gray-900" : "text-red-600"
                        }`}
                      >
                        {sickBalance} days
                      </td>
                      <td
                        className={`px-4 py-3 text-sm ${
                          extraBalance >= 0 ? "text-gray-900" : "text-red-600"
                        }`}
                      >
                        {extraBalance} days
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLedgerHistory && (
        <div className="rounded border border-gray-300 bg-white overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">Leaves History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Leave Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Change
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No leaves found
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{entry.user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{entry.leaveType}</td>
                      <td
                        className={`px-4 py-3 text-sm font-medium ${
                          entry.change > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {entry.change > 0 ? "+" : ""}
                        {entry.change}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{entry.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
