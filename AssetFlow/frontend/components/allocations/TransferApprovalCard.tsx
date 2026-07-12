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
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-lg mb-2">Transfer Request</h3>
        <p className="text-sm text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Asset ID:</span> {transfer.assetId}
        </p>
        <p className="text-sm text-slate-400 mb-1">
          <span className="font-medium text-slate-300">From:</span> {transfer.fromHolderId}
        </p>
        <p className="text-sm text-slate-400 mb-4">
          <span className="font-medium text-slate-300">To:</span> {transfer.toHolderId} ({transfer.toHolderType})
        </p>
      </div>

      {!rejectMode ? (
        <div className="flex gap-2 mt-4">
          <button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-500 py-1.5 rounded text-sm font-medium">
            Approve
          </button>
          <button onClick={() => setRejectMode(true)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded text-sm font-medium">
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="Reason for rejection"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-500 py-1.5 rounded text-sm font-medium">
              Confirm Reject
            </button>
            <button onClick={() => setRejectMode(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
