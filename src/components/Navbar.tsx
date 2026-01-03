"use client";

import Image from "next/image";
import CheckInStatus from "./CheckInStatus";
import Navigation from "./Navigation";
import { useSession } from "next-auth/react";
import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-neutral-700 bg-neutral-800 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {session?.user?.companyLogo?.trim() ? (
          <Image
            src={session.user.companyLogo}
            width={100}
            height={100}
            alt="Company Logo"
            className="rounded-md object-contain h-10"
          />
        ) : (
          <>Company Logo</>
        )}

        <Navigation />

        <div className="flex items-center gap-4">
          <CheckInStatus />
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
}
