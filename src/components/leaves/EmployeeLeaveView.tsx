"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getLeaveRequests } from "@/app/(with navbar)/time-off/action";
import type { LeaveRequest } from "@/types/leave";
import LeaveSummary from "./LeaveSummary";
import LeaveTable from "./LeaveTable";
import LeaveRequestModal from "./LeaveRequestModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Props {
  user: User;
  initialLeaveRequests: LeaveRequest[];
}

export default function EmployeeLeaveView({
  user,
  initialLeaveRequests,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [isPending, startTransition] = useTransition();

  const fetchLeaveRequests = useCallback(async () => {
    startTransition(async () => {
      const result = await getLeaveRequests();
      if (result.success) {
        setLeaveRequests(result.data || []);
      } else {
        toast.error(result.error || "Failed to fetch leave requests");
      }
    });
  }, []);

  const handleSuccess = () => {
    fetchLeaveRequests();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Time Off</h1>

      <LeaveSummary leaveRequests={leaveRequests} />

      <div>
        <Link
          href="/time-off/add"
          className="inline-block w-full sm:w-auto rounded border border-gray-900 bg-gray-900 px-4 sm:px-6 py-2 text-sm sm:text-base text-white hover:bg-gray-800 text-center"
        >
          NEW
        </Link>
      </div>

      <LeaveTable records={leaveRequests} />

      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        currentUserName={user.name}
      />
    </div>
  );
}

