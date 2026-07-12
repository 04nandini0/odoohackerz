"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAllocationSchema } from "@/lib/zod-schemas/allocation";
import { useAllocationStore } from "@/store/allocationStore";
import { useState, useEffect } from "react";
import { useAssetStore } from "@/store/assetStore";
import { toast } from "sonner";
import AllocationConflictAlert from "./AllocationConflictAlert";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Allocate Asset</h2>
        
        {conflictError && (
          <div className="mb-4">
            <AllocationConflictAlert error={conflictError} />
          </div>
        )}

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
            <label className="block text-sm font-medium mb-1">Holder Type</label>
            <select {...register("holderType")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2">
              <option value="Employee">Employee</option>
              <option value="Department">Department</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Holder ID</label>
            <input {...register("holderId")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" placeholder="Employee or Dept ID" />
            {errors.holderId && <p className="text-red-500 text-sm mt-1">{errors.holderId.message?.toString()}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expected Return Date</label>
            <input type="date" {...register("expectedReturnDate")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">Allocate</button>
          </div>
        </form>
      </div>
    </div>
  );
}
