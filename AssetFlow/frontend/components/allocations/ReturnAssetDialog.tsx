"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReturnAllocationSchema } from "@/lib/zod-schemas/allocation";
import { useAllocationStore, Allocation } from "@/store/allocationStore";
import { toast } from "sonner";

import { motion } from "framer-motion";
import { X, ClipboardCheck, FileText } from "lucide-react";

export default function ReturnAssetDialog({ allocation, onClose }: { allocation: Allocation, onClose: () => void }) {
  const returnAsset = useAllocationStore((state) => state.returnAsset);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ReturnAllocationSchema),
    defaultValues: { checkInCondition: "Good" }
  });

  const onSubmit = async (data: any) => {
    try {
      await returnAsset(allocation.id, data);
      toast.success("Asset returned successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.error || "Failed to return asset");
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
          <h2 className="text-xl font-semibold text-white">Return Asset</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-zinc-500" /> Check-in Condition
              </label>
              <select 
                {...register("checkInCondition")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
              </select>
              {errors.checkInCondition && <p className="text-rose-400 text-xs mt-1">{errors.checkInCondition.message?.toString()}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-500" /> Notes <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <textarea 
                {...register("checkInNotes")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none h-24 resize-none" 
                placeholder="Any damages, missing accessories, etc." 
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
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.1)] transition-all"
              >
                Confirm Return
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
