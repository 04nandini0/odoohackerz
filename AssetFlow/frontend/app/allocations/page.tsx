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
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
            Allocations & Transfers
          </h1>
          <p className="text-slate-500">Manage asset assignments and handle transfer requests.</p>
        </div>
        <button 
          onClick={() => setShowAllocate(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-5 py-2.5 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20"
        >
          <span>+ Allocate Asset</span>
        </button>
      </div>

      {activeTransfers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Pending Transfers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTransfers.map(t => (
              <TransferApprovalCard key={t.id} transfer={t} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Allocation Directory</h2>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-border shadow-sm rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Returned">Returned</option>
          </select>
        </div>

        <div className="glass-panel overflow-hidden border border-border bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-xs uppercase tracking-wider font-semibold text-slate-500">
                <th className="px-6 py-4">Asset ID</th>
                <th className="px-6 py-4">Holder</th>
                <th className="px-6 py-4">Allocated At</th>
                <th className="px-6 py-4">Expected Return</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredAllocations.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{a.assetId}</td>
                  <td className="px-6 py-4 text-slate-600">{a.holderId} <span className="text-xs text-slate-400 ml-1">({a.holderType})</span></td>
                  <td className="px-6 py-4 text-slate-600">{format(new Date(a.allocatedAt), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    {a.expectedReturnDate ? (
                      <span className={new Date(a.expectedReturnDate) < new Date() && a.status === 'Active' ? 'text-rose-600 font-medium' : 'text-slate-600'}>
                        {format(new Date(a.expectedReturnDate), 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border shadow-sm ${
                      a.status === 'Active' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-slate-100 text-slate-500 border-border'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.status === 'Active' && (
                      <button 
                        onClick={() => setReturningAllocation(a)}
                        className="text-emerald-700 hover:text-emerald-800 text-xs font-medium px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 shadow-sm hover:bg-emerald-100 transition-colors"
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