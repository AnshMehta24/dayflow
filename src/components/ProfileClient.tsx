"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Camera } from "lucide-react";
import SalaryInfoTab from "./tabs/SalaryInfoTab";
import PrivateInfoTab from "./tabs/PrivateInfoTab";
import ResumeTab from "./tabs/ResumeTabs";

type TabType = "resume" | "private" | "salary";

interface ProfileClientProps {
  user: any;
  currentUserId: string;
  isOwnProfile: boolean;
  canSeeSalary: boolean;
  currentUserRole: string;
}

export default function ProfileClient({
  user,
  isOwnProfile,
  canSeeSalary,
  currentUserRole,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("resume");

  const tabs: { id: TabType; label: string; visible: boolean }[] = [
    { id: "resume", label: "Resume", visible: true },
    { id: "private", label: "Private Info", visible: isOwnProfile },
    { id: "salary", label: "Salary Info", visible: canSeeSalary },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-8">
          <div className="flex gap-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.name}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* {isOwnProfile && (
                <button className="absolute bottom-0 right-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2.5 shadow-lg transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )} */}
            </div>

            {/* Profile Information Grid */}
            <div className="flex-1 grid grid-cols-2 gap-x-16 gap-y-4">
              {/* Left Column */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">
                  {user.name}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-500 text-sm font-medium block mb-1">
                      Login ID
                    </label>
                    <div className="text-gray-900">{user.loginId || "-"}</div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-sm font-medium block mb-1">
                      Email
                    </label>
                    <div className="text-gray-900">{user.email}</div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-sm font-medium block mb-1">
                      Mobile
                    </label>
                    <div className="text-gray-900">{user.mobile || "-"}</div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-500 text-sm font-medium block mb-1">
                    Company
                  </label>
                  <div className="text-gray-900 font-medium">
                    {user.company.name}
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-sm font-medium block mb-1">
                    Department
                  </label>
                  <div className="text-gray-900">{user.department || "-"}</div>
                </div>
                <div>
                  <label className="text-gray-500 text-sm font-medium block mb-1">
                    Manager
                  </label>
                  <div className="text-gray-900">{user.manager || "-"}</div>
                </div>
                <div>
                  <label className="text-gray-500 text-sm font-medium block mb-1">
                    Location
                  </label>
                  <div className="text-gray-900">{user.location || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6">
          <div className="flex gap-1">
            {tabs.map(
              (tab) =>
                tab.visible && (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-medium text-sm transition-all relative ${
                      activeTab === tab.id
                        ? "text-teal-600 bg-gray-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
                    )}
                  </button>
                )
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {activeTab === "resume" && (
          <ResumeTab user={user} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === "private" && isOwnProfile && (
          <PrivateInfoTab user={user} />
        )}
        {activeTab === "salary" && canSeeSalary && (
          <SalaryInfoTab
            user={user}
            isOwnProfile={isOwnProfile}
            isHR={currentUserRole === "HR"}
          />
        )}
      </div>
    </div>
  );
}
