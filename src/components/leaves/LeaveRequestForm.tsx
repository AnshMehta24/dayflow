"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  applyLeave,
  getEmployeeLeaveBalance,
} from "@/app/(with navbar)/time-off/action";
import { toast } from "sonner";

const leaveRequestSchema = z
  .object({
    leaveType: z.enum(["PAID", "SICK", "UNPAID"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    remarks: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return start >= today;
    },
    {
      message: "Start date must be today or in the future",
      path: ["startDate"],
    }
  );

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  currentUserName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  inModal?: boolean;
}

export default function LeaveRequestForm({
  currentUserName,
  onSuccess,
  onCancel,
  showCancel = true,
  inModal = false,
}: LeaveRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<{
    PAID?: { balance: number; availableBalance: number; reserved: number };
    SICK?: { balance: number; availableBalance: number; reserved: number };
  }>({});
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveType: "PAID",
      startDate: "",
      endDate: "",
      remarks: "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const leaveType = watch("leaveType");

  // Fetch leave balances
  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoadingBalance(true);
      try {
        const [paidResult, sickResult] = await Promise.all([
          getEmployeeLeaveBalance(undefined, "PAID"),
          getEmployeeLeaveBalance(undefined, "SICK"),
        ]);

        if (paidResult.success && paidResult.data) {
          setLeaveBalances((prev) => ({
            ...prev,
            PAID: paidResult.data as {
              balance: number;
              availableBalance: number;
              reserved: number;
            },
          }));
        }

        if (sickResult.success && sickResult.data) {
          setLeaveBalances((prev) => ({
            ...prev,
            SICK: sickResult.data as {
              balance: number;
              availableBalance: number;
              reserved: number;
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching leave balances:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalances();
  }, []);

  // Refresh balance when form is reset after successful submission
  useEffect(() => {
    if (!isSubmitting) {
      const refreshBalance = async () => {
        if (leaveType === "PAID" || leaveType === "SICK") {
          try {
            const result = await getEmployeeLeaveBalance(undefined, leaveType);
            if (result.success && result.data) {
              setLeaveBalances((prev) => ({
                ...prev,
                [leaveType]: result.data as {
                  balance: number;
                  availableBalance: number;
                  reserved: number;
                },
              }));
            }
          } catch (error) {
            console.error("Error refreshing balance:", error);
          }
        }
      };
      refreshBalance();
    }
  }, [isSubmitting, leaveType]);

  // Calculate days between dates
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const allocation =
    startDate && endDate ? calculateDays(startDate, endDate) : 0;

  const onSubmit = async (data: LeaveRequestFormData) => {
    setIsSubmitting(true);
    try {
      const result = await applyLeave({
        leaveType: data.leaveType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        remarks: data.remarks,
      });

      if (result.success) {
        toast.success(result.message || "Leave request submitted successfully");
        reset();
        onSuccess?.();
        router.push("/time-off");
      } else {
        const errorMessage = result.error || "Failed to submit leave request";
        toast.error(errorMessage, {
          duration: 6000,
        });

        if (
          result.data &&
          (result.data as any).suggestedLeaveType === "UNPAID"
        ) {
          toast.info(
            "You can apply for Unpaid Leave instead, which doesn't require a balance.",
            {
              duration: 5000,
            }
          );
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error submitting leave request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/time-off");
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {/* Employee Name (read-only) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Employee
          </label>
          <input
            type="text"
            value={currentUserName}
            readOnly
            className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600"
          />
        </div>

        {/* Time Off Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Time Off Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register("leaveType")}
            className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
          >
            <option value="PAID">Paid Time Off</option>
            <option value="SICK">Sick Leave</option>
            <option value="UNPAID">Unpaid Leave</option>
          </select>
          {errors.leaveType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.leaveType.message}
            </p>
          )}
          {/* Show available balance for PAID and SICK leave */}
          {(leaveType === "PAID" || leaveType === "SICK") &&
            !isLoadingBalance && (
              <div className="mt-2 rounded bg-gray-50 p-2 text-sm">
                {leaveType === "PAID" && leaveBalances.PAID ? (
                  <div className="text-gray-700">
                    <span className="font-medium">Available Balance:</span>{" "}
                    <span
                      className={
                        leaveBalances.PAID.availableBalance >= allocation
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {leaveBalances.PAID.availableBalance} day(s)
                    </span>
                    {leaveBalances.PAID.reserved > 0 && (
                      <span className="ml-2 text-gray-500">
                        ({leaveBalances.PAID.balance} total,{" "}
                        {leaveBalances.PAID.reserved} pending)
                      </span>
                    )}
                    {allocation > 0 &&
                      leaveBalances.PAID.availableBalance < allocation && (
                        <p className="mt-1 text-xs text-red-600">
                          ⚠️ Insufficient balance. Consider applying for Unpaid
                          Leave instead.
                        </p>
                      )}
                  </div>
                ) : leaveType === "SICK" && leaveBalances.SICK ? (
                  <div className="text-gray-700">
                    <span className="font-medium">Available Balance:</span>{" "}
                    <span
                      className={
                        leaveBalances.SICK.availableBalance >= allocation
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {leaveBalances.SICK.availableBalance} day(s)
                    </span>
                    {leaveBalances.SICK.reserved > 0 && (
                      <span className="ml-2 text-gray-500">
                        ({leaveBalances.SICK.balance} total,{" "}
                        {leaveBalances.SICK.reserved} pending)
                      </span>
                    )}
                    {allocation > 0 &&
                      leaveBalances.SICK.availableBalance < allocation && (
                        <p className="mt-1 text-xs text-red-600">
                          ⚠️ Insufficient balance. Consider applying for Unpaid
                          Leave instead.
                        </p>
                      )}
                  </div>
                ) : (
                  <div className="text-gray-500">Loading balance...</div>
                )}
              </div>
            )}
        </div>

        {/* Validity Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("startDate")}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.startDate.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("endDate")}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Allocation */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Allocation
          </label>
          <input
            type="text"
            value={`${allocation} days`}
            readOnly
            className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600"
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Remarks
          </label>
          <textarea
            {...register("remarks")}
            rows={3}
            placeholder="Optional remarks..."
            className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-gray-900"
          />
          {errors.remarks && (
            <p className="mt-1 text-sm text-red-600">
              {errors.remarks.message}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
        {showCancel && (
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded border border-gray-300 bg-white px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-900 hover:bg-gray-50 focus:outline-none focus:border-gray-900 disabled:opacity-50"
          >
            Discard
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded border border-gray-900 bg-gray-900 px-4 sm:px-6 py-2 text-sm sm:text-base text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );

  if (inModal) {
    return formContent;
  }

  return (
    <div className="w-full max-w-2xl rounded border border-gray-300 bg-white p-4 sm:p-6">
      {formContent}
    </div>
  );
}
