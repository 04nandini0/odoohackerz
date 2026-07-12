"use client";

import { useEffect, useState } from "react";
import { useOrganizationStore } from "@/store/organizationStore";
import { useAssetStore } from "@/store/assetStore";
import { useDebounce } from "@/lib/hooks/useDebounce"; // Assuming this exists or I will just write a quick one

export default function AssetFilters() {
  const { fetchAssets } = useAssetStore();
  const { assetCategories, departments, fetchAssetCategories, fetchDepartments } = useOrganizationStore();
  
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchAssetCategories();
    fetchDepartments();
  }, [fetchAssetCategories, fetchDepartments]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets({
        search,
        categoryId,
        status,
        departmentId,
        location
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryId, status, departmentId, location, fetchAssets]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, tag, or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
        <div className="w-full md:w-48">
          <input
            type="text"
            placeholder="Location filter"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        >
          <option value="">All Categories</option>
          {assetCategories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="Reserved">Reserved</option>
          <option value="UnderMaintenance">Under Maintenance</option>
          <option value="Lost">Lost</option>
          <option value="Retired">Retired</option>
          <option value="Disposed">Disposed</option>
        </select>

        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
