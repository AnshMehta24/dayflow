import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getLeaveRequests } from "./action";
import EmployeeLeaveView from "@/components/leaves/EmployeeLeaveView";
import HRLeaveView from "@/components/leaves/HRLeaveView";

export default async function TimeOffPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

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
    redirect("/auth/login");
  }

  const leaveRequestsResult = await getLeaveRequests();
  const initialLeaveRequests = leaveRequestsResult.success
    ? leaveRequestsResult.data || []
    : [];

  if (user.role === "EMPLOYEE") {
    return (
      <EmployeeLeaveView
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        initialLeaveRequests={initialLeaveRequests}
      />
    );
  }

  return (
    <HRLeaveView
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      initialLeaveRequests={initialLeaveRequests}
    />
  );
}
