"use client";

interface DateNavigatorProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

export default function DateNavigator({
  currentDate,
  onDateChange,
}: DateNavigatorProps) {
  const handlePrev = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split("T")[0]);
  };

  const handleNext = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split("T")[0]);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
      <div className="flex gap-2 sm:gap-4">
        <button
          onClick={handlePrev}
          className="flex-1 sm:flex-none rounded border border-gray-300 bg-white px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-900 hover:bg-gray-50 focus:outline-none focus:border-gray-900"
        >
          ← Prev
        </button>
        <button
          onClick={handleNext}
          className="flex-1 sm:flex-none rounded border border-gray-300 bg-white px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-900 hover:bg-gray-50 focus:outline-none focus:border-gray-900"
        >
          Next →
        </button>
      </div>
      <input
        type="date"
        value={currentDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="rounded border border-gray-300 bg-white px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-gray-900"
      />
    </div>
  );
}

