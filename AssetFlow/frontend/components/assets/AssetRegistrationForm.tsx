"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganizationStore } from "@/store/organizationStore";
import { useAssetStore } from "@/store/assetStore";
import { buildRegistrationSchema } from "@/lib/zod-schemas/asset";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AssetRegistrationForm() {
  const router = useRouter();
  const { assetCategories, fetchAssetCategories } = useOrganizationStore();
  const { createAsset, uploadPhoto } = useAssetStore();
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssetCategories();
  }, [fetchAssetCategories]);

  const currentCategory = assetCategories.find(c => c.id === selectedCategory);
  
  // Dynamic schema based on selected category
  const dynamicSchema = currentCategory 
    ? buildRegistrationSchema(currentCategory.customFields)
    : buildRegistrationSchema([]); // fallback empty custom fields

  const methods = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      serialNumber: "",
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: 0,
      condition: "New",
      location: "",
      isBookable: false,
      customFieldValues: {}
    }
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = methods;

  // Update form category ID when dropdown changes so validation runs correctly
  useEffect(() => {
    setValue("categoryId", selectedCategory);
  }, [selectedCategory, setValue]);

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...filesArray]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      setApiError(null);
      
      // 1. Create asset
      const createdAsset = await createAsset(data);
      
      // 2. Upload photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          try {
             await uploadPhoto(createdAsset.id, photo);
          } catch (e) {
             console.error("Failed to upload a photo", e);
             toast.error("Asset registered, but a photo failed to upload.");
          }
        }
      }

      toast.success(`Asset ${createdAsset.tag} registered successfully!`);
      router.push(`/assets/${createdAsset.id}`);
    } catch (e: any) {
      setApiError(e.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Register New Asset</h2>
      
      {apiError && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-md text-sm">{apiError}</div>}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asset Category *</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        >
          <option value="" disabled>Select a category...</option>
          {assetCategories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message as string}</p>}
      </div>

      {selectedCategory && (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Standard Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asset Name *</label>
                  <input
                    {...register("name")}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="e.g. MacBook Pro 16"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Serial Number</label>
                  <input
                    {...register("serialNumber")}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location *</label>
                  <input
                    {...register("location")}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="e.g. IT Storage Room"
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message as string}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Acquisition Date</label>
                    <input
                      type="date"
                      {...register("acquisitionDate")}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    {errors.acquisitionDate && <p className="mt-1 text-sm text-red-600">{errors.acquisitionDate.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("acquisitionCost", { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    {errors.acquisitionCost && <p className="mt-1 text-sm text-red-600">{errors.acquisitionCost.message as string}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                  <select
                    {...register("condition")}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>

                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    {...register("isBookable")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    This is a shared/bookable resource
                  </label>
                </div>
              </div>

              {/* Dynamic Fields & Uploads */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Category Specific Details</h3>
                  
                  {currentCategory?.customFields.map((field) => (
                    <div key={field.fieldName}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.fieldName} {field.required && '*'}
                      </label>
                      <input
                        type={field.fieldType === "date" ? "date" : field.fieldType === "number" ? "number" : "text"}
                        step={field.fieldType === "number" ? "any" : undefined}
                        {...register(`customFieldValues.${field.fieldName}`)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      />
                      {/* @ts-ignore */}
                      {errors.customFieldValues?.[field.fieldName] && (
                        /* @ts-ignore */
                        <p className="mt-1 text-sm text-red-600">{errors.customFieldValues[field.fieldName]?.message}</p>
                      )}
                    </div>
                  ))}
                  
                  {currentCategory?.customFields.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No specific fields required for this category.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Photos</h3>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload files</span>
                          <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={onPhotoChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {photos.map((photo, idx) => (
                        <div key={idx} className="relative w-20 h-20 border rounded-md overflow-hidden bg-gray-100">
                          <img src={URL.createObjectURL(photo)} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-4 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Registering..." : "Register Asset"}
              </button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
}
