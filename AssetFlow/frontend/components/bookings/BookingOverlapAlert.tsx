"use client";

import { format } from "date-fns";

export default function BookingOverlapAlert({ error }: { error: any }) {
  if (!error) return null;

  return (
    <div className="bg-red-900/50 border border-red-500/50 rounded p-4 mb-4">
      <h3 className="text-red-400 font-bold mb-1">Booking Conflict</h3>
      <p className="text-sm text-red-200 mb-2">{error.message}</p>
      <div className="bg-red-950/50 p-2 rounded text-xs text-red-300 font-medium">
        <p>Conflicting Time Window:</p>
        <p>{format(new Date(error.conflictingStart), "MMM dd, yyyy HH:mm")} — {format(new Date(error.conflictingEnd), "HH:mm")}</p>
      </div>
    </div>
  );
}
