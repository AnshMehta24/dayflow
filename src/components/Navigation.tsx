"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation({
  userRole,
}: {
  userRole: string | undefined;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex gap-6">
      {userRole === "HR" && (
        <Link
          href="/dashboard"
          className={`px-4 py-2 ${
            isActive("/dashboard")
              ? "border-b-2 border-neutral-800 font-medium text-neutral-900"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Employee
        </Link>
      )}

      <Link
        href="/attendence"
        className={`px-4 py-2 ${
          isActive("/attendence")
            ? "border-b-2 border-neutral-800 font-medium text-neutral-900"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        Attendance
      </Link>

      <Link
        href="/time-off"
        className={`px-4 py-2 ${
          isActive("/time-off")
            ? "border-b-2 border-neutral-800 font-medium text-neutral-900"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        Time Off
      </Link>
    </div>
  );
}
