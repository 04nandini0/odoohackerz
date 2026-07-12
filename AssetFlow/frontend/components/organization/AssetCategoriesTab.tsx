"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganizationStore } from "@/store/organizationStore";
import { CreateAssetCategorySchema, CreateAssetCategoryFormValues } from "@/lib/zod-schemas/organization";

export default function AssetCategoriesTab() {
  const { assetCategories, createAssetCategory, deleteAssetCategory, isLoading, error } = useOrganizationStore();
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAssetCategoryFormValues>({
    resolver: zodResolver(CreateAssetCategorySchema),
    defaultValues: {
      name: "",
      customFields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customFields",
  });

  const onSubmit = async (data: CreateAssetCategoryFormValues) => {
    try {
      await createAssetCategory(data);
      reset();
      setIsAdding(false);
    } catch (e) {
      // Error handled by store
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Asset Categories</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {isAdding ? "Cancel" : "Add Category"}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Create New Asset Category</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
              <input
                {...register("name")}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g. Electronics"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Fields</label>
                <button
                  type="button"
                  onClick={() => append({ fieldName: "", fieldType: "text", required: false })}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  + Add Field
                </button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start mb-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <input
                      {...register(`customFields.${index}.fieldName` as const)}
                      placeholder="Field Name (e.g. Serial Number)"
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    {errors.customFields?.[index]?.fieldName && (
                      <p className="mt-1 text-xs text-red-600">{errors.customFields[index]?.fieldName?.message}</p>
                    )}
                  </div>
                  <div className="w-32">
                    <select
                      {...register(`customFields.${index}.fieldType` as const)}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  <div className="flex items-center h-9">
                    <input
                      type="checkbox"
                      {...register(`customFields.${index}.required` as const)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Req</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="h-9 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-sm text-gray-500 italic">No custom fields added. Assets in this category will only have standard fields.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {assetCategories.map((category) => (
            <li key={category.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.name}
                </p>
                <div className="mt-1 flex items-center text-sm text-gray-500 space-x-2">
                  <span>{category.customFields.length} Custom Field(s)</span>
                  {category.customFields.length > 0 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                      {category.customFields.map(cf => cf.fieldName).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this category? (Will fail if assets are using it)")) {
                      deleteAssetCategory(category.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {assetCategories.length === 0 && !isLoading && (
            <li className="p-4 text-center text-sm text-gray-500">No asset categories found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
