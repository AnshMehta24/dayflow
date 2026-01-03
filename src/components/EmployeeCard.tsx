interface Employee {
  id: string;
  name: string | null;
  email: string;
  loginId: string | null;
  role: string;
  createdAt: string;
}

interface EmployeeCardProps {
  employee: Employee;
  onClick: () => void;
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  const initials =
    employee.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-xl hover:shadow-red-500/10 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-16 h-16 bg-linear-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-semibold text-xl shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
              {employee.name || "No Name"}
            </h3>
            <p className="text-sm text-gray-600 truncate">{employee.email}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {employee.loginId}</p>
            <span
              className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                employee.role === "HR"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {employee.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
