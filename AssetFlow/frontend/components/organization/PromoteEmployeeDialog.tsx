"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganizationStore } from "@/store/organizationStore";
import { PromoteEmployeeSchema, PromoteEmployeeFormValues } from "@/lib/zod-schemas/organization";
import { toast } from "sonner";

interface PromoteEmployeeDialogProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

export default function PromoteEmployeeDialog({ employeeId, employeeName, onClose }: PromoteEmployeeDialogProps) {
  const { promoteEmployee } = useOrganizationStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PromoteEmployeeFormValues>({
    resolver: zodResolver(PromoteEmployeeSchema),
    defaultValues: {
      newRole: "DepartmentHead"
    }
  });

  const selectedRole = watch("newRole");

  const onSubmit = async (data: PromoteEmployeeFormValues) => {
    try {
      setApiError(null);
      await promoteEmployee(employeeId, data.newRole);
      toast.success(`Successfully promoted ${employeeName} to ${data.newRole}`);
      onClose();
    } catch (e: any) {
      setApiError(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Promote Employee</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to promote <strong className="text-gray-900 dark:text-white">{employeeName}</strong>. 
              Please select their new organizational role.
            </p>

            {apiError && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{apiError}</div>}

            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 dark:border-gray-600">
                <input
                  type="radio"
                  value="DepartmentHead"
                  {...register("newRole")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-200">Department Head</span>
              </label>

              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 dark:border-gray-600">
                <input
                  type="radio"
                  value="AssetManager"
                  {...register("newRole")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-200">Asset Manager</span>
              </label>
              {errors.newRole && <p className="text-sm text-red-600">{errors.newRole.message}</p>}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Notice:</strong> This will grant {employeeName} {selectedRole} permissions across the organization immediately.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Promoting..." : "Confirm Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
