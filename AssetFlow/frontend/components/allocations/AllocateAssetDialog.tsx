"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAllocationSchema } from "@/lib/zod-schemas/allocation";
import { useAllocationStore } from "@/store/allocationStore";
import { useState, useEffect } from "react";
import { useAssetStore } from "@/store/assetStore";
import { toast } from "sonner";
import AllocationConflictAlert from "./AllocationConflictAlert";

import { motion } from "framer-motion";
import { X, Box, User, Calendar } from "lucide-react";

export default function AllocateAssetDialog({ onClose }: { onClose: () => void }) {
  const allocate = useAllocationStore((state) => state.allocate);
  const { assets, fetchAssets } = useAssetStore();
  const [conflictError, setConflictError] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateAllocationSchema),
    defaultValues: { holderType: "Employee" }
  });

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const onSubmit = async (data: any) => {
    setConflictError(null);
    try {
      await allocate(data);
      toast.success("Asset allocated successfully");
      onClose();
    } catch (err: any) {
      if (err.error === "AssetAlreadyAllocated") {
        setConflictError(err);
      } else {
        toast.error(err.error || "Failed to allocate asset");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md glass-panel overflow-hidden shadow-2xl"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-surface-100/50">
          <h2 className="text-xl font-semibold text-white">Allocate Asset</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {conflictError && (
            <div className="mb-4">
              <AllocationConflictAlert error={conflictError} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-zinc-500" /> Asset
              </label>
              <select 
                {...register("assetId")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
              >
                <option value="">Select Asset...</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
                ))}
              </select>
              {errors.assetId && <p className="text-rose-400 text-xs mt-1">{errors.assetId.message?.toString()}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-zinc-500" /> Holder Type
              </label>
              <select 
                {...register("holderType")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
              >
                <option value="Employee">Employee</option>
                <option value="Department">Department</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-zinc-500" /> Holder ID
              </label>
              <input 
                {...register("holderId")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none" 
                placeholder="Employee or Dept ID" 
              />
              {errors.holderId && <p className="text-rose-400 text-xs mt-1">{errors.holderId.message?.toString()}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-500" /> Expected Return <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input 
                type="date" 
                {...register("expectedReturnDate")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none [color-scheme:dark]" 
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-surface-100/50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all"
              >
                Allocate
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
