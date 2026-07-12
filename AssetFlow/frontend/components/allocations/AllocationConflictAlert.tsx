"use client";

import { useState } from "react";
import TransferRequestDialog from "./TransferRequestDialog";

export default function AllocationConflictAlert({ error }: { error: any }) {
  const [showTransfer, setShowTransfer] = useState(false);

  return (
    <div className="bg-red-900/50 border border-red-500/50 rounded p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-red-400 font-bold mb-1">Allocation Conflict</h3>
          <p className="text-sm text-red-200">{error.message}</p>
        </div>
        <button 
          onClick={() => setShowTransfer(true)}
          className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1 rounded"
        >
          Request Transfer
        </button>
      </div>

      {showTransfer && (
        <TransferRequestDialog 
          allocationId={error.allocationId} 
          currentHolderName={error.currentHolderName}
          onClose={() => setShowTransfer(false)} 
        />
      )}
    </div>
  );
}
