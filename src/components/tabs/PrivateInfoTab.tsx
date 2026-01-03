"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PrivateInfoTabProps {
  user: any;
}

export default function PrivateInfoTab({ user }: PrivateInfoTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    loginId: user.loginId || "",
    mobile: user.mobile || "",
    department: user.department || "",
    manager: user.manager || "",
    location: user.location || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      loginId: user.loginId || "",
      mobile: user.mobile || "",
      department: user.department || "",
      manager: user.manager || "",
      location: user.location || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Private Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 rounded transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="border border-gray-700 rounded-lg p-8">
        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
              />
            ) : (
              <div className="text-white py-2">{user.name}</div>
            )}
          </div>

          {/* Login ID */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Login ID</label>
            {isEditing ? (
              <input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
              />
            ) : (
              <div className="text-white py-2">{user.loginId || "-"}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
              />
            ) : (
              <div className="text-white py-2">{user.email}</div>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Mobile</label>
            {isEditing ? (
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
              />
            ) : (
              <div className="text-white py-2">{user.mobile || "-"}</div>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Department
            </label>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
              />
            ) : (
              <div className="text-white py-2">{user.department || "-"}</div>
            )}
          </div>

          {/* Manager */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Manager</label>
            {isEditing ? (
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
              />
            ) : (
              <div className="text-white py-2">{user.manager || "-"}</div>
            )}
          </div>

          {/* Company (Read-only) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Company</label>
            <div className="text-gray-500 py-2">{user.company.name}</div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Location</label>
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
              />
            ) : (
              <div className="text-white py-2">{user.location || "-"}</div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        {!isEditing && (
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Security</h3>
            <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
              Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
