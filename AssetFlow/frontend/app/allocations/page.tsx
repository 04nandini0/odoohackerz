"use client";

import { useEffect, useState } from "react";
import { useAllocationStore } from "@/store/allocationStore";
import AllocateAssetDialog from "@/components/allocations/AllocateAssetDialog";
import TransferApprovalCard from "@/components/allocations/TransferApprovalCard";
import ReturnAssetDialog from "@/components/allocations/ReturnAssetDialog";
import { format } from "date-fns";

export default function AllocationsPage() {
  const { allocations, transfers, fetchAll, fetchTransfers } = useAllocationStore();
  const [showAllocate, setShowAllocate] = useState(false);
  const [returningAllocation, setReturningAllocation] = useState<any>(null);
  const [filter, setFilter] = useState("Active");

  useEffect(() => {
    fetchAll();
    fetchTransfers("Requested");
  }, [fetchAll, fetchTransfers]);

  const filteredAllocations = allocations.filter(a => filter === "All" || a.status === filter);
  const activeTransfers = transfers.filter(t => t.status === "Requested");

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Allocations & Transfers
          </h1>
          <p className="text-slate-400 mt-1">Manage asset assignments and handle transfer requests.</p>
        </div>
        <button 
          onClick={() => setShowAllocate(true)}
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium shadow-lg shadow-indigo-900/20 transition-all"
        >
          + Allocate Asset
        </button>
      </div>

      {activeTransfers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Pending Transfers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTransfers.map(t => (
              <TransferApprovalCard key={t.id} transfer={t} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-semibold text-slate-200">Allocation Directory</h2>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Returned">Returned</option>
          </select>
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-sm font-medium text-slate-400">
                <th className="p-4">Asset ID</th>
                <th className="p-4">Holder</th>
                <th className="p-4">Allocated At</th>
                <th className="p-4">Expected Return</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {filteredAllocations.map(a => (
                <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium text-slate-200">{a.assetId}</td>
                  <td className="p-4">{a.holderId} <span className="text-xs text-slate-500 ml-1">({a.holderType})</span></td>
                  <td className="p-4">{format(new Date(a.allocatedAt), 'MMM dd, yyyy')}</td>
                  <td className="p-4">
                    {a.expectedReturnDate ? (
                      <span className={new Date(a.expectedReturnDate) < new Date() && a.status === 'Active' ? 'text-red-400 font-medium' : ''}>
                        {format(new Date(a.expectedReturnDate), 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.status === 'Active' ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {a.status === 'Active' && (
                      <button 
                        onClick={() => setReturningAllocation(a)}
                        className="text-emerald-400 hover:text-emerald-300 text-xs font-medium px-3 py-1 bg-emerald-900/20 rounded border border-emerald-800/30 transition-colors"
                      >
                        Return Asset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAllocations.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No allocations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAllocate && <AllocateAssetDialog onClose={() => setShowAllocate(false)} />}
      {returningAllocation && <ReturnAssetDialog allocation={returningAllocation} onClose={() => setReturningAllocation(null)} />}
    </div>
  );
}