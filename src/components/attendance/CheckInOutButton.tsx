"use client";

interface CheckInOutButtonProps {
  isCheckedIn: boolean;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  loading?: boolean;
}

export default function CheckInOutButton({
  isCheckedIn,
  onCheckIn,
  onCheckOut,
  loading = false,
}: CheckInOutButtonProps) {
  const handleClick = async () => {
    if (isCheckedIn) {
      await onCheckOut();
    } else {
      await onCheckIn();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
        isCheckedIn
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-green-600 hover:bg-green-700 text-white"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <span className="hidden sm:inline">Processing...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : isCheckedIn ? (
        "Check Out"
      ) : (
        "Check In"
      )}
    </button>
  );
}