import React from "react";

export const JourneyPhaseLabel: React.FC<{ status: string }> = ({ status }) => {
  let label = status;
  let bgClass = "bg-gray-100 text-gray-800 border-gray-200";

  if (status === "new") {
    label = "New";
    bgClass = "bg-blue-100 text-blue-800 border-blue-200";
  } else if (status === "contacted") {
    label = "Contacted";
    bgClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
  } else if (status === "pre_approved" || status === "in_escrow") {
    label = "Qualified";
    bgClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
  } else if (status === "closed" || status === "archived") {
    label = "Closed";
    bgClass = "bg-gray-100 text-gray-800 border-gray-200";
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border shadow-2xs whitespace-nowrap ${bgClass}`} title="Master Lead Journey Phase">
      <span className="opacity-70">Journey:</span> {label}
    </span>
  );
};
