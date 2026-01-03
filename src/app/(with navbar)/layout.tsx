import Navigation from "@/components/Navigation";
import CheckInStatusDialog from "@/components/CheckInStatusDialog";
import {Toaster} from "sonner"

export default function WithNavbarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Toaster richColors />
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="border-b border-gray-300 bg-white px-4 sm:px-6 py-4 relative">
          <div className="flex items-center justify-between">
            {/* Company Logo */}
            <div className="text-lg sm:text-xl font-semibold truncate text-gray-900">Company Logo</div>

            {/* Navigation Tabs */}
            <Navigation />

            <CheckInStatusDialog />
          </div>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">{children}</main>
      </div>
    </>
  );
}
