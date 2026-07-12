"use client";

import { useEffect, useState } from "react";
import { useOrganizationStore } from "@/store/organizationStore";
import { useAssetStore } from "@/store/assetStore";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Search, MapPin, Tag, Box, Building2 } from "lucide-react";

export default function AssetFilters() {
  const { fetchAssets } = useAssetStore();
  const { assetCategories, departments, fetchAssetCategories, fetchDepartments } = useOrganizationStore();
  
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [location, setLocation] = useState("");

  const debouncedSearch = useDebounce(search, 300);
  const debouncedLocation = useDebounce(location, 300);

  useEffect(() => {
    fetchAssetCategories();
    fetchDepartments();
  }, [fetchAssetCategories, fetchDepartments]);

  useEffect(() => {
    fetchAssets({
      search: debouncedSearch,
      categoryId,
      status,
      departmentId,
      location: debouncedLocation
    });
  }, [debouncedSearch, categoryId, status, departmentId, debouncedLocation, fetchAssets]);

  const inputClasses = "w-full bg-white border border-border shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white transition-all outline-none appearance-none";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-primary-600 transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className={iconClasses.replace('pointer-events-none ', '')} />
          <input
            type="text"
            placeholder="Search by name, tag, or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="w-full md:w-64 relative group">
          <MapPin className={iconClasses.replace('pointer-events-none ', '')} />
          <input
            type="text"
            placeholder="Filter by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Box className={iconClasses} />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClasses}
          >
            <option value="" className="bg-white">All Categories</option>
            {assetCategories.map(c => (
              <option key={c.id} value={c.id} className="bg-white">{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 relative group">
          <Tag className={iconClasses} />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClasses}
          >
            <option value="" className="bg-white">All Statuses</option>
            <option value="Available" className="bg-white">Available</option>
            <option value="Allocated" className="bg-white">Allocated</option>
            <option value="Reserved" className="bg-white">Reserved</option>
            <option value="InMaintenance" className="bg-white">In Maintenance</option>
            <option value="Lost" className="bg-white">Lost</option>
            <option value="Retired" className="bg-white">Retired</option>
          </select>
        </div>

        <div className="flex-1 relative group">
          <Building2 className={iconClasses} />
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className={inputClasses}
          >
            <option value="" className="bg-white">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id} className="bg-white">{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
