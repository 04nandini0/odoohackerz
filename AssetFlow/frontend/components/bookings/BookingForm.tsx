"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBookingSchema } from "@/lib/zod-schemas/booking";
import { useBookingStore } from "@/store/bookingStore";
import { useAssetStore } from "@/store/assetStore";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import BookingOverlapAlert from "./BookingOverlapAlert";
import { motion } from "framer-motion";
import { X, Calendar, Clock, PenTool } from "lucide-react";

export default function BookingForm({ selectedDate, onClose }: { selectedDate?: Date, onClose: () => void }) {
  const createBooking = useBookingStore(state => state.createBooking);
  const { assets, fetchAssets } = useAssetStore();
  const [conflictError, setConflictError] = useState<any>(null);

  const bookableAssets = assets.filter(a => a.isBookable);

  // Format defaults
  const now = selectedDate || new Date();
  const later = new Date(now.getTime() + 60 * 60000); // 1 hour later
  
  const toLocalIso = (d: Date) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: { 
      startTime: toLocalIso(now),
      endTime: toLocalIso(later)
    }
  });

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const onSubmit = async (data: any) => {
    setConflictError(null);
    try {
      // Ensure UTC format before sending
      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString()
      };
      
      await createBooking(payload);
      toast.success("Resource booked successfully");
      onClose();
    } catch (err: any) {
      if (err.error === "BookingOverlap") {
        setConflictError(err);
      } else {
        toast.error(err.error || "Failed to book resource");
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
          <h2 className="text-xl font-semibold text-white">Book Resource</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <BookingOverlapAlert error={conflictError} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Resource</label>
              <select 
                {...register("resourceAssetId")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
              >
                <option value="">Select Resource...</option>
                {bookableAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
                ))}
              </select>
              {errors.resourceAssetId && <p className="text-rose-400 text-xs mt-1">{errors.resourceAssetId.message?.toString()}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-500" /> Start Time
                </label>
                <input 
                  type="datetime-local" 
                  {...register("startTime")} 
                  className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none [color-scheme:dark]" 
                />
                {errors.startTime && <p className="text-rose-400 text-xs mt-1">{errors.startTime.message?.toString()}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-500" /> End Time
                </label>
                <input 
                  type="datetime-local" 
                  {...register("endTime")} 
                  className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none [color-scheme:dark]" 
                />
                {errors.endTime && <p className="text-rose-400 text-xs mt-1">{errors.endTime.message?.toString()}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-zinc-500" /> Purpose <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input 
                {...register("purpose")} 
                className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none" 
                placeholder="e.g. Sync meeting" 
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
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
