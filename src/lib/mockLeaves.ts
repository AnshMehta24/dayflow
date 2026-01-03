import { UserRole, CURRENT_ROLE } from "./mockAttendance";

export interface LeaveRequest {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: "Paid Time Off" | "Sick Leave" | "Unpaid Leave";
  status: "Pending" | "Approved" | "Rejected";
  attachment?: string;
}

export interface LeaveSummary {
  paidTimeOff: number;
  sickLeave: number;
}

// Mock current user name (for employee view)
const CURRENT_USER_NAME = "John Doe";

// Mock leave requests for current user (EMPLOYEE view)
export const mockMyLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    employeeName: CURRENT_USER_NAME,
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    leaveType: "Paid Time Off",
    status: "Approved",
  },
  {
    id: "2",
    employeeName: CURRENT_USER_NAME,
    startDate: "2024-01-22",
    endDate: "2024-01-22",
    leaveType: "Sick Leave",
    status: "Pending",
    attachment: "medical-certificate.pdf",
  },
  {
    id: "3",
    employeeName: CURRENT_USER_NAME,
    startDate: "2024-02-05",
    endDate: "2024-02-07",
    leaveType: "Paid Time Off",
    status: "Rejected",
  },
];

// Mock leave requests for all employees (HR view)
export const mockAllLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    employeeName: "John Doe",
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    leaveType: "Paid Time Off",
    status: "Approved",
  },
  {
    id: "2",
    employeeName: "John Doe",
    startDate: "2024-01-22",
    endDate: "2024-01-22",
    leaveType: "Sick Leave",
    status: "Pending",
    attachment: "medical-certificate.pdf",
  },
  {
    id: "3",
    employeeName: "Jane Smith",
    startDate: "2024-01-20",
    endDate: "2024-01-21",
    leaveType: "Paid Time Off",
    status: "Pending",
  },
  {
    id: "4",
    employeeName: "Bob Johnson",
    startDate: "2024-01-25",
    endDate: "2024-01-25",
    leaveType: "Sick Leave",
    status: "Approved",
    attachment: "doctor-note.pdf",
  },
  {
    id: "5",
    employeeName: "Alice Williams",
    startDate: "2024-02-01",
    endDate: "2024-02-03",
    leaveType: "Unpaid Leave",
    status: "Pending",
  },
  {
    id: "6",
    employeeName: "John Doe",
    startDate: "2024-02-05",
    endDate: "2024-02-07",
    leaveType: "Paid Time Off",
    status: "Rejected",
  },
];

// Mock leave summary
export const mockLeaveSummary: LeaveSummary = {
  paidTimeOff: 15,
  sickLeave: 10,
};

// Helper function to format date to DD/MM/YYYY
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper function to calculate days between dates
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

