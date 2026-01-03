"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  console.log(session, "Session");

  if (status === "loading") {
    return <p className="p-6">Loading…</p>;
  }

  if (!session) {
    return <p className="p-6">You are not logged in.</p>;
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <div className="space-y-3 text-gray-800">
          <p>
            <span className="font-semibold">Name:</span> {user?.name}
          </p>

          <p>
            <span className="font-semibold">Email:</span> {user?.email}
          </p>

          <p>
            <span className="font-semibold">Role:</span> {user?.role}
          </p>
        </div>
      </div>
    </div>
  );
}
