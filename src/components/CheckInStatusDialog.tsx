"use client";

import { useState, useEffect } from "react";
import { Circle } from "lucide-react";
import {
  checkIn,
  checkOut,
  getCurrentCheckInStatus,
} from "@/app/(with navbar)/attendence/action";
import { toast } from "sonner";

interface CheckInStatus {
  hasCheckedIn: boolean;
  isCurrentlyCheckedIn: boolean;
  lastEntry: unknown;
  totalHours: number;
}

export default function CheckInStatusDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const result = await getCurrentCheckInStatus();
      if (result.success) {
        setCheckInStatus(result.data || null);
      } else {
        toast.error(result.error || "Failed to fetch check-in status");
      }
    } catch (error) {
      toast.error("Failed to fetch check-in status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCheckIn = async () => {
    setIsProcessing(true);
    try {
      const result = await checkIn();
      if (result.success) {
        toast.success(result.message || "Checked in successfully");
        await fetchStatus();
        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to check in");
      }
    } catch (error) {
      toast.error("Failed to check in");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setIsProcessing(true);
    try {
      const result = await checkOut();
      if (result.success) {
        toast.success(result.message || "Checked out successfully");
        await fetchStatus();
        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to check out");
      }
    } catch (error) {
      toast.error("Failed to check out");
    } finally {
      setIsProcessing(false);
    }
  };

  const isCheckedIn = checkInStatus?.isCurrentlyCheckedIn || false;

  return (
    <>
      {/* Circle Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 sm:gap-3  cursor-pointer"
        aria-label={isCheckedIn ? "Checked In" : "Not Checked In"}
        disabled={isLoading}
        title={isCheckedIn ? "Checked In" : "Not Checked In"}
      >
        <Circle
          className={`h-5 w-5 ${
            isLoading
              ? "text-gray-400"
              : isCheckedIn
              ? "text-green-500"
              : "text-gray-400"
          }`}
          fill="currentColor"
        />
      </button>

      {/* Dialog with Backdrop Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Dialog Content */}
          <div
            className="relative bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {isCheckedIn ? "Check Out" : "Check In"}
            </h2>

            <p className="text-gray-600 mb-6">
              {isCheckedIn
                ? "Are you sure you want to check out?"
                : "Ready to check in for today?"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 rounded border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                disabled={isProcessing}
                className={`flex-1 px-4 py-2 rounded font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCheckedIn
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : isCheckedIn ? (
                  "Check Out"
                ) : (
                  "Check In"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
