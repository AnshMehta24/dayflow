export type LeaveType = "PAID" | "SICK" | "UNPAID" | "EXTRA";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveRequest {
  id: string;
  employeeName?: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  remarks?: string | null;
  status: LeaveStatus;
  adminComment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function leaveTypeToDisplay(leaveType: LeaveType): string {
  switch (leaveType) {
    case "PAID":
      return "Paid Time Off";
    case "SICK":
      return "Sick Leave";
    case "UNPAID":
      return "Unpaid Leave";
    case "EXTRA":
      return "Extra Leave";
    default:
      return leaveType;
  }
}

export function displayToLeaveType(display: string): LeaveType {
  switch (display) {
    case "Paid Time Off":
      return "PAID";
    case "Sick Leave":
      return "SICK";
    case "Unpaid Leave":
      return "UNPAID";
    case "Extra Leave":
      return "EXTRA";
    default:
      return display as LeaveType;
  }
}

export function leaveStatusToDisplay(status: LeaveStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export function displayToLeaveStatus(display: string): LeaveStatus {
  switch (display) {
    case "Pending":
      return "PENDING";
    case "Approved":
      return "APPROVED";
    case "Rejected":
      return "REJECTED";
    default:
      return display as LeaveStatus;
  }
}

