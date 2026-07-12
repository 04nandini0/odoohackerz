"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBookingSchema } from "@/lib/zod-schemas/booking";
import { useBookingStore } from "@/store/bookingStore";
import { useAssetStore } from "@/store/assetStore";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import BookingOverlapAlert from "./BookingOverlapAlert";

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Book Resource</h2>
        
        <BookingOverlapAlert error={conflictError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Resource</label>
            <select {...register("resourceAssetId")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2">
              <option value="">Select Resource...</option>
              {bookableAssets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
              ))}
            </select>
            {errors.resourceAssetId && <p className="text-red-500 text-sm mt-1">{errors.resourceAssetId.message?.toString()}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input type="datetime-local" {...register("startTime")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
              {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message?.toString()}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input type="datetime-local" {...register("endTime")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
              {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message?.toString()}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Purpose (Optional)</label>
            <input {...register("purpose")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" placeholder="e.g. Sync meeting" />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700">Book</button>
          </div>
        </form>
      </div>
    </div>
  );
}
