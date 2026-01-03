"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const user = session?.user;

  const avatar =
    user?.image ||
    "https://ui-avatars.com/api/?background=0F172A&color=fff&name=" +
      encodeURIComponent(user?.name || "User");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-neutral-600"
      >
        <Image
          src={avatar}
          width={34}
          height={34}
          className="rounded-full"
          alt="Profile"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50">
          <div className="px-3 py-2 text-xs text-neutral-400">
            {user?.name}
            <br />
            {user?.email}
          </div>

          <Link
            href="/profile"
            className="block px-3 py-2 text-sm hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            View Profile
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-neutral-800"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
