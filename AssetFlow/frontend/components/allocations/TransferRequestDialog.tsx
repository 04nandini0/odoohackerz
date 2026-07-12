"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTransferSchema } from "@/lib/zod-schemas/allocation";
import { useAllocationStore } from "@/store/allocationStore";
import { toast } from "sonner";

export default function TransferRequestDialog({ allocationId, currentHolderName, onClose }: { allocationId: string, currentHolderName: string, onClose: () => void }) {
  const requestTransfer = useAllocationStore((state) => state.requestTransfer);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateTransferSchema),
    defaultValues: { allocationId, toHolderType: "Employee" }
  });

  const onSubmit = async (data: any) => {
    try {
      await requestTransfer(data);
      toast.success("Transfer requested successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.error || "Failed to request transfer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Request Transfer</h2>
        <p className="text-sm text-slate-400 mb-4">
          This asset is currently held by <strong>{currentHolderName}</strong>. 
          Requesting a transfer will notify them to release the asset to you.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("allocationId")} />
          
          <div>
            <label className="block text-sm font-medium mb-1">New Holder Type</label>
            <select {...register("toHolderType")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2">
              <option value="Employee">Employee</option>
              <option value="Department">Department</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New Holder ID</label>
            <input {...register("toHolderId")} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" placeholder="Your Employee ID" />
            {errors.toHolderId && <p className="text-red-500 text-sm mt-1">{errors.toHolderId.message?.toString()}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}
