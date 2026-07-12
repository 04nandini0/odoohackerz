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
          <button onClick={handleApprove} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 py-2 rounded-xl text-xs font-medium transition-all shadow-[inset_0_0_8px_rgba(16,185,129,0.1)]">Approve</button>
          <button onClick={() => setIsRejecting(true)} className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 py-2 rounded-xl text-xs font-medium transition-all shadow-[inset_0_0_8px_rgba(244,63,94,0.1)]">Reject</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="Rejection reason" 
            value={reason} 
            onChange={e => setReason(e.target.value)}
            className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
          />
          <div className="flex gap-2">
            <button onClick={handleReject} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-1.5 rounded-xl text-xs font-medium shadow-lg shadow-rose-500/20 transition-all">Confirm</button>
            <button onClick={() => setIsRejecting(false)} className="flex-1 bg-surface-100 hover:bg-surface-100/80 text-zinc-300 py-1.5 rounded-xl text-xs font-medium transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
