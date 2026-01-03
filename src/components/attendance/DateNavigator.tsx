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
    <div className="flex items-center gap-4">
      <button
        onClick={handlePrev}
        className="rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700"
      >
        ← Prev
      </button>
      <input
        type="date"
        value={currentDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200"
      />
      <button
        onClick={handleNext}
        className="rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700"
      >
        Next →
      </button>
    </div>
  );
}

