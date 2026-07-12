"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import RaiseRequestForm from "@/components/maintenance/RaiseRequestForm";
import MaintenanceStatusBadge from "@/components/maintenance/MaintenanceStatusBadge";
import ApprovalActions from "@/components/maintenance/ApprovalActions";
import { format } from "date-fns";
import { useAssetStore } from "@/store/assetStore";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Wrench, AlertTriangle, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MaintenancePage() {
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const { data: requests, mutate, isLoading } = useSWR<any[]>("/api/maintenance", fetcher);
  const { assets, fetchAssets } = useAssetStore();
  const [role, setRole] = useState("");
  
  useEffect(() => {
    fetchAssets();
    const uRole = localStorage.getItem("userRole") || "Admin";
    setRole(uRole);
  }, [fetchAssets]);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm';
      case 'High': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
      case 'Medium': return 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm';
      default: return 'bg-slate-100 text-slate-500 border-border shadow-sm';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical': return <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
      case 'High': return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      case 'Medium': return <Clock className="w-3.5 h-3.5 mr-1" />;
      default: return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
            Maintenance & Repairs
          </h1>
          <p className="text-slate-500">Track and manage asset repairs, servicing, and technical support.</p>
        </div>
        
        <button 
          onClick={() => setShowRaiseForm(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-5 py-2.5 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20"
        >
          <Wrench className="w-5 h-5" />
          <span>Raise Request</span>
        </button>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {requests?.map((req, i) => {
              const asset = assets.find(a => a.id === req.assetId);
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={req.id} 
                  className="glass-card p-6 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary-100 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <MaintenanceStatusBadge status={req.status} />
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full border flex items-center shadow-sm", 
                        getPriorityStyle(req.priority)
                      )}>
                        {getPriorityIcon(req.priority)}
                        {req.priority}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">
                        {asset?.name || req.assetId}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-1 px-2 py-0.5 bg-slate-50 rounded inline-block border border-border">
                        {asset?.tag || 'Unknown Asset'}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 border border-border mb-5 relative overflow-hidden group-hover:border-primary-100 transition-colors">
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {req.issue}
                      </p>
                    </div>
                    
                    <div className="text-xs text-slate-500 flex flex-col gap-1.5 mb-2">
                      <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-border shadow-sm">
                        <span className="flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5 text-slate-400" /> Raised</span>
                        <span className="text-slate-700 font-medium">{format(new Date(req.raisedAt), 'MMM dd, yyyy')}</span>
                      </div>
                      {req.resolvedAt && (
                        <div className="flex justify-between items-center bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolved</span>
                          <span className="text-emerald-700 font-medium">{format(new Date(req.resolvedAt), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(role === "Admin" || role === "AssetManager") && req.status === "Pending" && (
                    <div className="pt-5 mt-2 border-t border-border relative z-10">
                      <ApprovalActions requestId={req.id} onComplete={() => mutate()} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {requests?.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-20 glass-card border-dashed"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-border shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">All Caught Up</h3>
              <p className="text-slate-500 mt-1">No maintenance requests found.</p>
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showRaiseForm && (
          <RaiseRequestForm 
            assets={assets.filter(a => a.status === "Allocated" || a.status === "Available")} 
            onClose={() => setShowRaiseForm(false)} 
            onSubmitSuccess={() => mutate()} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}