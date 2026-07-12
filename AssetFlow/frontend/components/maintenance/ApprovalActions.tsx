"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ApprovalActions({ requestId, onComplete }: { requestId: string, onComplete: () => void }) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    try {
      const res = await fetch(`/api/maintenance/${requestId}/approve`, { method: "PUT" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Request approved");
      onComplete();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Reason required");
      return;
    }
    try {
      const res = await fetch(`/api/maintenance/${requestId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: reason })
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Request rejected");
      setIsRejecting(false);
      onComplete();
    } catch (e: any) {
      toast.error(e.message || "Failed to reject");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full mt-2">
      {!isRejecting ? (
        <div className="flex gap-2">
          <button onClick={handleApprove} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded text-xs font-medium transition-colors">Approve</button>
          <button onClick={() => setIsRejecting(true)} className="flex-1 bg-red-900/50 hover:bg-red-800/80 border border-red-800 text-red-200 py-1.5 rounded text-xs font-medium transition-colors">Reject</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="Rejection reason" 
            value={reason} 
            onChange={e => setReason(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
          />
          <div className="flex gap-2">
            <button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-500 py-1 rounded text-xs font-medium">Confirm</button>
            <button onClick={() => setIsRejecting(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-1 rounded text-xs font-medium">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
