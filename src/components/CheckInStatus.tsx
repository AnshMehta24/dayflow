"use client";

import { useState } from "react";
import { Circle } from "lucide-react";
import { Plane } from "lucide-react";

type Status = "present" | "absent" | "leave";

export default function CheckInStatus() {
  const [status, setStatus] = useState<Status>("present");

  const cycleStatus = () => {
    setStatus((prev) => {
      if (prev === "present") return "absent";
      if (prev === "absent") return "leave";
      return "present";
    });
  };

  const getStatusIcon = () => {
    if (status === "leave") {
      return <Plane className="h-3 w-3 text-blue-400" fill="currentColor" />;
    }
    return (
      <Circle
        className={`h-3 w-3 ${
          status === "present" ? "text-green-500" : "text-yellow-500"
        }`}
        fill="currentColor"
      />
    );
  };

  const getStatusLabel = () => {
    if (status === "present") return "Present";
    if (status === "absent") return "Absent";
    return "On Leave";
  };

  return (
    <button
      onClick={cycleStatus}
      className="flex items-center gap-3"
      aria-label={getStatusLabel()}
    >
      {/* Status Indicator */}
      {getStatusIcon()}
      
      {/* Profile Icon */}
      <div className="h-8 w-8 rounded-full bg-neutral-700"></div>
    </button>
  );
}

