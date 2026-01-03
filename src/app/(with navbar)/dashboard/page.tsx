import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import EmployeesPage from "@/components/EmployeePage";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function EmployeesServerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if(session.user.role !== "HR"){
    redirect("/attendence")
  }

  const company = await prisma.company.findUnique({
    where: {
      id: session.user.companyId,
    },
  });

  if (!company) {
    redirect("/login");
  }

  const employees = await prisma.user.findMany({
    where: {
      companyId: company.id,
      NOT: {
        id: session.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      loginId: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedEmployees = employees.map((emp) => ({
    ...emp,
    createdAt: emp.createdAt.toISOString(),
  }));

  const formattedCompany = {
    id: company.id,
    name: company.name,
    companyLogo: company.companyLogo,
  };

  const user = {
    role: session.user.role,
  };

  return (
    <EmployeesPage
      employees={formattedEmployees}
      company={formattedCompany}
      user={user}
    />
  );
}
