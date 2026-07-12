"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateMaintenanceRequestSchema } from "@/lib/zod-schemas/maintenance";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { X, Wrench, AlertCircle, FileText } from "lucide-react";

export default function RaiseRequestForm({ assets, onClose, onSubmitSuccess }: { assets: any[], onClose: () => void, onSubmitSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateMaintenanceRequestSchema),
    defaultValues: { priority: "Medium" }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ...data, photoUrls: [] })
      });

      if (!res.ok) throw new Error(await res.text());
      
      toast.success("Maintenance request raised successfully");
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to raise request");
    } finally {
      setIsSubmitting(false);
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
          <h2 className="text-xl font-semibold text-white">Raise Maintenance Request</h2>
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
                <Wrench className="w-4 h-4 text-zinc-500" /> Asset
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
                <AlertCircle className="w-4 h-4 text-zinc-500" /> Priority
              </label>
              <select 
                {...register("priority")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-500" /> Issue Description
              </label>
              <textarea 
                {...register("issue")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none h-28 resize-none" 
                placeholder="Describe the problem in detail..." 
              />
              {errors.issue && <p className="text-rose-400 text-xs mt-1">{errors.issue.message?.toString()}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-surface-100/50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
