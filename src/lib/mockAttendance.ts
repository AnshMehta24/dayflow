import { AttendanceRecord } from "@/types/attendance";

export type UserRole = "EMPLOYEE" | "HR";

// Toggle this constant to switch roles
export const CURRENT_ROLE: UserRole = "HR";

// Mock data for current user (EMPLOYEE or HR viewing their own attendance)
export const mockMyAttendance: AttendanceRecord[] = [
  {
    id: "1",
    date: "2024-01-01",
    checkIn: "09:00",
    checkOut: "18:00",
    workHours: 8,
    totalHours: 0,
  },
  {
    id: "2",
    date: "2024-01-02",
    checkIn: "09:15",
    checkOut: "18:30",
    workHours: 8.25,
    totalHours: 0.25,
  },
  {
    id: "3",
    date: "2024-01-03",
    checkIn: "09:00",
    checkOut: "17:45",
    workHours: 7.75,
    totalHours: 0,
  },
  {
    id: "4",
    date: "2024-01-04",
    checkIn: null,
    checkOut: null,
    workHours: 0,
    totalHours: 0,
  },
  {
    id: "5",
    date: "2024-01-05",
    checkIn: "08:45",
    checkOut: "19:00",
    workHours: 9.25,
    totalHours: 1.25,
  },
  {
    id: "6",
    date: "2024-01-08",
    checkIn: "09:00",
    checkOut: "18:00",
    workHours: 8,
    totalHours: 0,
  },
  {
    id: "7",
    date: "2024-01-09",
    checkIn: "09:30",
    checkOut: "18:15",
    workHours: 7.75,
    totalHours: 0,
  },
  {
    id: "8",
    date: "2024-01-10",
    checkIn: "09:00",
    checkOut: "18:00",
    workHours: 8,
    totalHours: 0,
  },
];

// Mock data for HR viewing all employees
export const mockEmployeeAttendance: AttendanceRecord[] = [
  {
    id: "e1-1",
    employeeName: "John Doe",
    date: "2024-01-01",
    checkIn: "09:00",
    checkOut: "18:00",
    workHours: 8,
    totalHours: 0,
  },
  {
    id: "e1-2",
    employeeName: "John Doe",
    date: "2024-01-02",
    checkIn: "09:15",
    checkOut: "18:30",
    workHours: 8.25,
    totalHours: 0.25,
  },
  {
    id: "e2-1",
    employeeName: "Jane Smith",
    date: "2024-01-01",
    checkIn: "08:45",
    checkOut: "17:45",
    workHours: 8,
    totalHours: 0,
  },
  {
    id: "e2-2",
    employeeName: "Jane Smith",
    date: "2024-01-02",
    checkIn: "09:00",
    checkOut: "18:00",
    workHours: 8,
    totalHours: 0,
  },
  {
    id: "e3-1",
    employeeName: "Bob Johnson",
    date: "2024-01-01",
    checkIn: null,
    checkOut: null,
    workHours: 0,
    totalHours: 0,
  },
  {
    id: "e3-2",
    employeeName: "Bob Johnson",
    date: "2024-01-02",
    checkIn: "09:30",
    checkOut: "19:00",
    workHours: 8.5,
    totalHours: 0.5,
  },
  {
    id: "e4-1",
    employeeName: "Alice Williams",
    date: "2024-01-01",
    checkIn: "09:00",
    checkOut: "18:00",
    workHours: 8,
    totalHours: 0,
  },
  {
    id: "e4-2",
    employeeName: "Alice Williams",
    date: "2024-01-02",
    checkIn: "08:30",
    checkOut: "18:30",
    workHours: 9,
    totalHours: 1,
  },
];

// Helper function to get summary stats
export function getAttendanceSummary(records: AttendanceRecord[]) {
  const daysPresent = records.filter(
    (r) => r.checkIn !== null && r.checkOut !== null
  ).length;
  const leavesCount = records.filter(
    (r) => r.checkIn === null && r.checkOut === null
  ).length;
  const totalWorkingDays = records.length;

  return {
    daysPresent,
    leavesCount,
    totalWorkingDays,
  };
}

