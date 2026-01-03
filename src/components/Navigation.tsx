"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex gap-6">
      <button className="px-4 py-2 text-neutral-400 hover:text-neutral-200">
        Employees
      </button>
      <Link
        href="/attendence"
        className={`px-4 py-2 ${
          isActive("/attendence")
            ? "border-b-2 border-neutral-200 font-medium text-neutral-200"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Attendance
      </Link>
      <Link
        href="/time-off"
        className={`px-4 py-2 ${
          isActive("/time-off")
            ? "border-b-2 border-neutral-200 font-medium text-neutral-200"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Time Off
      </Link>
    </div>
  );
}

