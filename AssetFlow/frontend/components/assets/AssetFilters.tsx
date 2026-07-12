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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, tag, or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-100/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 focus:bg-surface-50 transition-all outline-none"
          />
        </div>
        <div className="w-full md:w-64 relative group">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder="Filter by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-surface-100/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 focus:bg-surface-50 transition-all outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-focus-within:text-primary-400 transition-colors" />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-surface-100/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 focus:bg-surface-50 transition-all outline-none appearance-none"
          >
            <option value="" className="bg-surface-100">All Categories</option>
            {assetCategories.map(c => (
              <option key={c.id} value={c.id} className="bg-surface-100">{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 relative group">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-focus-within:text-primary-400 transition-colors" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-surface-100/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 focus:bg-surface-50 transition-all outline-none appearance-none"
          >
            <option value="" className="bg-surface-100">All Statuses</option>
            <option value="Available" className="bg-surface-100">Available</option>
            <option value="Allocated" className="bg-surface-100">Allocated</option>
            <option value="Reserved" className="bg-surface-100">Reserved</option>
            <option value="InMaintenance" className="bg-surface-100">In Maintenance</option>
            <option value="Lost" className="bg-surface-100">Lost</option>
            <option value="Retired" className="bg-surface-100">Retired</option>
          </select>
        </div>

        <div className="flex-1 relative group">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-focus-within:text-primary-400 transition-colors" />
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full bg-surface-100/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 focus:bg-surface-50 transition-all outline-none appearance-none"
          >
            <option value="" className="bg-surface-100">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id} className="bg-surface-100">{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
