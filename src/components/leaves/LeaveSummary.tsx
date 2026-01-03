"use client";

import { useEffect, useState } from "react";
import { getEmployeeLeaveBalance } from "@/app/(with navbar)/time-off/action";
import { LeaveType } from "@/types/leave";

interface LeaveSummaryProps {
  leaveRequests?: any[]; // Keep for backward compatibility but not used
}

interface LeaveBalance {
  leaveType: LeaveType;
  balance: number;
  availableBalance: number;
  reserved: number;
}

export default function LeaveSummary({ leaveRequests }: LeaveSummaryProps) {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true);
        const result = await getEmployeeLeaveBalance();
        if (result.success && result.data) {
          const balanceData = Array.isArray(result.data) ? result.data : [result.data];
          setBalances(balanceData);
        }
      } catch (error) {
        console.error("Error fetching leave balances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  // Filter to only show PAID, SICK, and EXTRA (if EXTRA has balance > 0)
  const displayBalances = balances.filter((balance) => {
    if (balance.leaveType === "PAID" || balance.leaveType === "SICK") {
      return true;
    }
    if (balance.leaveType === "EXTRA") {
      return balance.balance > 0;
    }
    return false;
  });

  // Sort: PAID first, SICK second, EXTRA third (UNPAID is not tracked/shown)
  const sortedBalances = displayBalances.sort((a, b) => {
    const order: Record<"PAID" | "SICK" | "EXTRA", number> = { PAID: 1, SICK: 2, EXTRA: 3 };
    return (order[a.leaveType as "PAID" | "SICK" | "EXTRA"] || 99) - (order[b.leaveType as "PAID" | "SICK" | "EXTRA"] || 99);
  });

  const getLeaveTypeLabel = (leaveType: LeaveType): string => {
    switch (leaveType) {
      case "PAID":
        return "Paid Time Off";
      case "SICK":
        return "Sick Leave";
      case "EXTRA":
        return "Extra Leave";
      default:
        return leaveType;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded border border-gray-300 bg-white p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${sortedBalances.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 sm:gap-4`}>
      {sortedBalances.map((balance) => (
        <div key={balance.leaveType} className="rounded border border-gray-300 bg-white p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">{getLeaveTypeLabel(balance.leaveType)}</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {balance.balance} Days
          </div>
        </div>
      ))}
    </div>
  );
}
