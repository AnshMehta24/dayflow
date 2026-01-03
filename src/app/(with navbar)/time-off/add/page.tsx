import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LeaveRequestForm from "@/components/leaves/LeaveRequestForm";

export default async function AddLeaveRequestPage() {
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
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "EMPLOYEE") {
    redirect("/time-off");
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/time-off"
          className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
        >
          ← Back to Time Off
        </Link>
      </div>
      
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
        New Time Off Request
      </h1>

      <LeaveRequestForm currentUserName={user.name} />
    </div>
  );
}

