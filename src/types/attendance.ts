export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE";

export interface AttendanceRecord {
  id: string;
  employeeName?: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number; 
  totalHours: number;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  totalHours: number;
}

