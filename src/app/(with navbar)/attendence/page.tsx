import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  getMyAttendance,
  getAllEmployeesAttendance,
  getAttendanceSummary,
  getCurrentCheckInStatus,
} from "./action";
import EmployeeAttendanceView from "@/components/attendance/EmployeeAttendanceView";
import HRAttendanceView from "@/components/attendance/HRAttendanceView";

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentDate = now.toISOString().split("T")[0];

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role === "EMPLOYEE") {
    const [attendanceResult, summaryResult, statusResult] = await Promise.all([
      getMyAttendance(currentMonth),
      getAttendanceSummary(user.id, currentMonth),
      getCurrentCheckInStatus(),
    ]);

    const initialAttendances = attendanceResult.success
      ? attendanceResult.data || []
      : [];
    const initialSummary = summaryResult.success
      ? summaryResult.data ?? null
      : null;
    const initialCheckInStatus = statusResult.success
      ? statusResult.data ?? null
      : null;

    return (
      <EmployeeAttendanceView
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        initialAttendances={initialAttendances}
        initialSummary={initialSummary}
        initialCheckInStatus={initialCheckInStatus}
        initialMonth={currentMonth}
      />
    );
  }

 
  const [myAttendanceResult, mySummaryResult, myStatusResult] =
    await Promise.all([
      getMyAttendance(currentMonth),
      getAttendanceSummary(user.id, currentMonth),
      getCurrentCheckInStatus(),
    ]);

  const employeesAttendanceResult = await getAllEmployeesAttendance(currentDate);

  const initialAttendances = myAttendanceResult.success
    ? myAttendanceResult.data || []
    : [];
  const initialSummary = mySummaryResult.success
    ? mySummaryResult.data ?? null
    : null;
  const initialCheckInStatus = myStatusResult.success
    ? myStatusResult.data ?? null
    : null;
  const initialEmployeeAttendances = employeesAttendanceResult.success
    ? employeesAttendanceResult.data || []
    : [];

  return (
    <HRAttendanceView
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      initialAttendances={initialAttendances}
      initialSummary={initialSummary}
      initialCheckInStatus={initialCheckInStatus}
      initialEmployeeAttendances={initialEmployeeAttendances}
      initialMonth={currentMonth}
      initialDate={currentDate}
    />
  );
}

