"use client";

import LeaveRequestForm from "./LeaveRequestForm";

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentUserName: string;
}

export default function LeaveRequestModal({
  isOpen,
  onClose,
  onSuccess,
  currentUserName,
}: LeaveRequestModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl mx-auto rounded border border-gray-300 bg-white p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900">
          New Time Off Request
        </h2>
        <LeaveRequestForm
          currentUserName={currentUserName}
          onSuccess={() => {
            onClose();
            onSuccess?.();
          }}
          onCancel={onClose}
          showCancel={true}
          inModal={true}
        />
      </div>
    </div>
  );
}
