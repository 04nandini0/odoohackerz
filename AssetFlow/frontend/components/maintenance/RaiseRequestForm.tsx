"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateMaintenanceRequestSchema } from "@/lib/zod-schemas/maintenance";
import { useState } from "react";
import { toast } from "sonner";

export default function RaiseRequestForm({ assets, onClose, onSubmitSuccess }: { assets: any[], onClose: () => void, onSubmitSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateMaintenanceRequestSchema),
    defaultValues: { priority: "Medium" }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Assuming token is injected by an interceptor or we're relying on browser cookies if configured
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Raise Maintenance Request</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <select {...register("assetId")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2">
              <option value="">Select Asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
              ))}
            </select>
            {errors.assetId && <p className="text-red-500 text-sm mt-1">{errors.assetId.message?.toString()}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select {...register("priority")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Issue Description</label>
            <textarea {...register("issue")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 h-24" placeholder="Describe the problem..." />
            {errors.issue && <p className="text-red-500 text-sm mt-1">{errors.issue.message?.toString()}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
