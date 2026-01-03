"use server";

import { redirect } from "next/navigation";

export default async function Home() {
  await redirect("/auth/login");
}
