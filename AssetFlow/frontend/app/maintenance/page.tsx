"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import RaiseRequestForm from "@/components/maintenance/RaiseRequestForm";
import MaintenanceStatusBadge from "@/components/maintenance/MaintenanceStatusBadge";
import ApprovalActions from "@/components/maintenance/ApprovalActions";
import { format } from "date-fns";
import { useAssetStore } from "@/store/assetStore";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MaintenancePage() {
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const { data: requests, mutate } = useSWR<any[]>("/api/maintenance", fetcher);
  const { assets, fetchAssets } = useAssetStore();
  
  // Naively get role from local storage for demo purposes to conditionally render approval actions
  const [role, setRole] = useState("");
  
  useEffect(() => {
    fetchAssets();
    // Assuming auth store or token decoder sets this
    const uRole = localStorage.getItem("userRole") || "Admin"; // Fallback to Admin for testing if not set
    setRole(uRole);
  }, [fetchAssets]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Maintenance Requests
          </h1>
          <p className="text-slate-400 mt-1">Track and manage asset repairs and servicing.</p>
        </div>
        <button 
          onClick={() => setShowRaiseForm(true)}
          className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg font-medium shadow-lg shadow-orange-900/20 transition-all"
        >
          + Raise Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests?.map(req => {
          const asset = assets.find(a => a.id === req.assetId);
          return (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <MaintenanceStatusBadge status={req.status} />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    req.priority === 'Critical' ? 'bg-red-500 text-white' :
                    req.priority === 'High' ? 'bg-orange-500 text-white' :
                    req.priority === 'Medium' ? 'bg-blue-500 text-white' :
                    'bg-slate-500 text-white'
                  }`}>
                    {req.priority}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-slate-200">{asset?.name || req.assetId}</h3>
                <p className="text-xs text-slate-500 font-mono mb-4">{asset?.tag || 'Unknown'}</p>
                
                <p className="text-sm text-slate-300 mb-4 line-clamp-3">{req.issue}</p>
                
                <div className="text-xs text-slate-500 mb-4">
                  <p>Raised: {format(new Date(req.raisedAt), 'MMM dd, yyyy')}</p>
                  {req.resolvedAt && <p>Resolved: {format(new Date(req.resolvedAt), 'MMM dd, yyyy')}</p>}
                </div>
              </div>

              {(role === "Admin" || role === "AssetManager") && req.status === "Pending" && (
                <div className="pt-4 border-t border-slate-800">
                  <ApprovalActions requestId={req.id} onComplete={() => mutate()} />
                </div>
              )}
            </div>
          );
        })}
        {requests?.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No maintenance requests found.
          </div>
        )}
      </div>

      {showRaiseForm && (
        <RaiseRequestForm 
          assets={assets.filter(a => a.status === "Allocated" || a.status === "Available")} 
          onClose={() => setShowRaiseForm(false)} 
          onSubmitSuccess={() => mutate()} 
        />
      )}
    </div>
  );
}