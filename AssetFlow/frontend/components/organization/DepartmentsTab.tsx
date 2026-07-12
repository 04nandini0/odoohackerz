"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganizationStore } from "@/store/organizationStore";
import { CreateDepartmentSchema, CreateDepartmentFormValues } from "@/lib/zod-schemas/organization";

export default function DepartmentsTab() {
  const { departments, employees, createDepartment, deactivateDepartment, isLoading, error } = useOrganizationStore();
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(CreateDepartmentSchema),
  });

  const onSubmit = async (data: CreateDepartmentFormValues) => {
    try {
      await createDepartment(data);
      reset();
      setIsAdding(false);
    } catch (e) {
      // Error handled by store
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Departments</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {isAdding ? "Cancel" : "Add Department"}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Create New Department</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                {...register("name")}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g. Engineering"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent Department</label>
              <select
                {...register("parentDepartmentId")}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              >
                <option value="">None (Top Level)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department Head</label>
              <select
                {...register("departmentHeadId")}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              >
                <option value="">None</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Assigning an Employee will auto-promote them to Department Head.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Department"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {departments.map((dept) => (
            <li key={dept.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {dept.name}
                  {dept.status === 'Inactive' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </p>
                <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                  {dept.parentDepartmentName && (
                    <span>Parent: {dept.parentDepartmentName}</span>
                  )}
                  {dept.departmentHeadName && (
                    <span>Head: {dept.departmentHeadName}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {dept.status === 'Active' && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to deactivate this department?")) {
                        deactivateDepartment(dept.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </li>
          ))}
          {departments.length === 0 && !isLoading && (
            <li className="p-4 text-center text-sm text-gray-500">No departments found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
