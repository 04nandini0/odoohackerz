"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReturnAllocationSchema } from "@/lib/zod-schemas/allocation";
import { useAllocationStore, Allocation } from "@/store/allocationStore";
import { toast } from "sonner";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Return Asset</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Check-in Condition</label>
            <select {...register("checkInCondition")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2">
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Damaged">Damaged</option>
            </select>
            {errors.checkInCondition && <p className="text-red-500 text-sm mt-1">{errors.checkInCondition.message?.toString()}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea {...register("checkInNotes")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 h-24" placeholder="Any damages, missing accessories, etc." />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700">Confirm Return</button>
          </div>
        </form>
      </div>
    </div>
  );
}
