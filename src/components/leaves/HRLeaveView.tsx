"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { getLeaveRequests, approveLeave, rejectLeave } from "@/app/(with navbar)/time-off/action";
import type { LeaveRequest } from "@/types/leave";
import LeaveSummary from "./LeaveSummary";
import LeaveTable from "./LeaveTable";
import LeavesTabs from "./LeavesTabs";
import SearchBar from "./SearchBar";
import RejectLeaveDialog from "./RejectLeaveDialog";
import LeaveAllocation from "./LeaveAllocation";

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

export default function HRLeaveView({
  user,
  initialLeaveRequests,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string | undefined>(undefined);
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

  const filteredLeaveRequests = useMemo(() => {
    if (!searchQuery.trim()) {
      return leaveRequests;
    }

    return leaveRequests.filter((request) =>
      request.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaveRequests, searchQuery]);

  const handleApprove = async (id: string) => {
    startTransition(async () => {
      const result = await approveLeave({ leaveRequestId: id });
      if (result.success) {
        toast.success(result.message || "Leave request approved successfully");
        await fetchLeaveRequests();
      } else {
        toast.error(result.error || "Failed to approve leave request");
      }
    });
  };

  const handleReject = (id: string) => {
    const leaveRequest = leaveRequests.find((req) => req.id === id);
    setSelectedLeaveId(id);
    setSelectedEmployeeName(leaveRequest?.employeeName);
    setRejectDialogOpen(true);
  };

  const handleRejectSuccess = () => {
    fetchLeaveRequests();
    setRejectDialogOpen(false);
    setSelectedLeaveId(null);
    setSelectedEmployeeName(undefined);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Time Off</h1>

      <LeavesTabs>
        {(activeTab) => {
          if (activeTab === "requests") {
            return (
              <>
                <LeaveSummary leaveRequests={leaveRequests} />

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
            return <LeaveAllocation />;
          }
        }}
      </LeavesTabs>

      {selectedLeaveId && (
        <RejectLeaveDialog
          isOpen={rejectDialogOpen}
          onClose={() => {
            setRejectDialogOpen(false);
            setSelectedLeaveId(null);
            setSelectedEmployeeName(undefined);
          }}
          leaveRequestId={selectedLeaveId}
          employeeName={selectedEmployeeName}
          onSuccess={handleRejectSuccess}
        />
      )}
    </div>
  );
}

