"use client";
import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";
import { InviteModal } from "@/components/InviteModal";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  name: string | null;
  email: string;
  loginId: string | null;
  role: string;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  companyLogo: string | null;
}

interface EmployeesPageProps {
  employees: Employee[];
  company: Company;
  user: {
    role: "HR" | "EMPLOYEE" | string;
  };
}

export default function EmployeesPage({
  employees,
  company,
  user,
}: EmployeesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.loginId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmployeeClick = (employeeId: string): void => {
    router.push(`/profile/${employeeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          {user.role === "HR" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <UserPlus className="w-5 h-5" />
              <span>NEW</span>
            </button>
          )}
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees by name, email, or login ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={() => handleEmployeeClick(employee.id)}
            />
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No employees found</p>
          </div>
        )}
      </div>

      <InviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyId={company.id}
        companyName={company.name}
      />
    </div>
  );
}
