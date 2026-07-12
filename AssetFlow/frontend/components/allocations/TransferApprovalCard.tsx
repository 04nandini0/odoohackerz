"use client";

import { useAllocationStore, Transfer } from "@/store/allocationStore";
import { useState } from "react";
import { toast } from "sonner";

export default function TransferApprovalCard({ transfer }: { transfer: Transfer }) {
  const approveTransfer = useAllocationStore(state => state.approveTransfer);
  const rejectTransfer = useAllocationStore(state => state.rejectTransfer);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    try {
      await approveTransfer(transfer.id);
      toast.success("Transfer approved");
    } catch (e: any) {
      toast.error(e.error || "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await rejectTransfer(transfer.id, reason);
      toast.success("Transfer rejected");
      setRejectMode(false);
    } catch (e: any) {
      toast.error(e.error || "Failed to reject");
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col justify-between group hover:shadow-2xl hover:border-white/10 hover:bg-surface-100/70 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
      
      <div className="relative z-10">
        <h3 className="font-semibold text-lg mb-4 text-white">Transfer Request</h3>
        
        <div className="space-y-3 bg-surface-100/30 rounded-xl p-4 border border-white/5 mb-5 relative overflow-hidden">
          <p className="text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">Asset ID:</span> {transfer.assetId}
          </p>
          <p className="text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">From:</span> {transfer.fromHolderId}
          </p>
          <p className="text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">To:</span> {transfer.toHolderId} <span className="text-xs ml-1">({transfer.toHolderType})</span>
          </p>
        </div>
      </div>

      <div className="relative z-10">
        {!rejectMode ? (
          <div className="flex gap-3">
            <button onClick={handleApprove} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 py-2 rounded-xl text-sm font-medium transition-all shadow-[inset_0_0_8px_rgba(16,185,129,0.1)]">
              Approve
            </button>
            <button onClick={() => setRejectMode(true)} className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 py-2 rounded-xl text-sm font-medium transition-all shadow-[inset_0_0_8px_rgba(244,63,94,0.1)]">
              Reject
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Reason for rejection"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
            />
            <div className="flex gap-3">
              <button onClick={handleReject} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-xl text-sm font-medium shadow-lg shadow-rose-500/20 transition-all">
                Confirm
              </button>
              <button onClick={() => setRejectMode(false)} className="flex-1 bg-surface-100 hover:bg-surface-100/80 text-zinc-300 py-2 rounded-xl text-sm font-medium transition-colors border border-white/5">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
