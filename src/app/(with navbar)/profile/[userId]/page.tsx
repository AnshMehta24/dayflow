import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileClient from "@/components/ProfileClient";
import { serialize } from "@/lib/serielizeData";

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: true,
      salaryInfo: true,
      skills: true,
      certifications: true,
    },
  });

  return user ? serialize(user) : null;
}

export default async function ProfilePage(Props: ProfilePageProps) {
  const session = await getServerSession(authOptions);

  const params = await Props.params;

  const user = await getUserData(params.userId);

  if (!user) {
    return notFound();
  }

  const currentUserId = session?.user.id;
  const isOwnProfile = currentUserId === params.userId;
  const isHR = session?.user.role === "HR";
  const canSeeSalary = isOwnProfile || isHR;

  return (
    <ProfileClient
      user={user}
      currentUserId={currentUserId!}
      isOwnProfile={isOwnProfile}
      canSeeSalary={canSeeSalary}
      currentUserRole={session?.user.role ?? "EMPLOYEE"}
    />
  );
}
