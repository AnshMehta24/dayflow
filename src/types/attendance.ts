export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE";

export interface AttendanceRecord {
  id: string;
  employeeName?: string; // Only for HR view
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number; // Hours for this specific entry
  totalHours: number; // Total hours for the day (same for all entries on the same day)
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  totalHours: number;
}

