import Navigation from "@/components/Navigation";
import CheckInStatusDialog from "@/components/CheckInStatusDialog";
import { Toaster } from "sonner";
import ProfileMenu from "@/components/ProfileMenu";
import Navbar from "@/components/Navbar";

export default function WithNavbarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Toaster richColors />
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />

        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {children}
        </main>
      </div>
    </>
  );
}
