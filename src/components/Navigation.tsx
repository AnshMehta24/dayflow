"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-6">
        <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
          Employees
        </button>
        <Link
          href="/attendence"
          className={`px-4 py-2 ${
            isActive("/attendence")
              ? "border-b-2 border-gray-900 font-medium text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Attendance
        </Link>
        <Link
          href="/time-off"
          className={`px-4 py-2 ${
            isActive("/time-off")
              ? "border-b-2 border-gray-900 font-medium text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Time Off
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden text-gray-900 p-2"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-300 md:hidden z-50">
          <div className="flex flex-col py-2">
            <button className="px-6 py-3 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              Employees
            </button>
            <Link
              href="/attendence"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-6 py-3 text-left ${
                isActive("/attendence")
                  ? "border-l-4 border-gray-900 font-medium text-gray-900 bg-gray-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Attendance
            </Link>
            <Link
              href="/time-off"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-6 py-3 text-left ${
                isActive("/time-off")
                  ? "border-l-4 border-gray-900 font-medium text-gray-900 bg-gray-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Time Off
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

