"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { rejectLeave } from "@/app/(with navbar)/time-off/action";
import { toast } from "sonner";

const rejectLeaveSchema = z.object({
  adminComment: z.string().min(1, "Admin comment is required for rejection"),
});

type RejectLeaveFormData = z.infer<typeof rejectLeaveSchema>;

interface RejectLeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequestId: string;
  employeeName?: string;
  onSuccess?: () => void;
}

export default function RejectLeaveDialog({
  isOpen,
  onClose,
  leaveRequestId,
  employeeName,
  onSuccess,
}: RejectLeaveDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectLeaveFormData>({
    resolver: zodResolver(rejectLeaveSchema),
    defaultValues: {
      adminComment: "",
    },
  });

  const onSubmit = async (data: RejectLeaveFormData) => {
    setIsSubmitting(true);
    try {
      const result = await rejectLeave({
        leaveRequestId,
        adminComment: data.adminComment,
      });

      if (result.success) {
        toast.success(result.message || "Leave request rejected successfully");
        reset();
        onClose();
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to reject leave request");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error rejecting leave request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded border border-gray-300 bg-white p-4 sm:p-6">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900">
          Reject Leave Request
        </h2>

        {employeeName && (
          <p className="mb-4 text-sm text-gray-600">
            Rejecting leave request for <span className="font-semibold">{employeeName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Admin Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("adminComment")}
                rows={4}
                placeholder="Please provide a reason for rejection..."
                className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-gray-900"
              />
              {errors.adminComment && (
                <p className="mt-1 text-sm text-red-600">{errors.adminComment.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded border border-gray-300 bg-white px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-900 hover:bg-gray-50 focus:outline-none focus:border-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded border border-red-600 bg-red-600 px-4 sm:px-6 py-2 text-sm sm:text-base text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Rejecting..." : "Reject Leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

