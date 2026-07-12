"use client";

import { useAssetStore } from "@/store/assetStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Laptop, Smartphone, Monitor, HardDrive, Cpu } from "lucide-react";

export default function AssetTable() {
  const { assets, isLoading, error } = useAssetStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-rose-600 bg-rose-50 text-center font-medium border-b border-rose-200">Failed to load assets: {error}</div>;
  }

  if (assets.length === 0) {
    return <div className="p-12 text-center text-slate-500">No assets found matching the criteria.</div>;
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
      case 'Allocated': return 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm';
      case 'InMaintenance': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
      case 'Retired': return 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm';
      case 'Lost': return 'bg-red-50 text-red-700 border-red-200 shadow-sm';
      default: return 'bg-slate-100 text-slate-500 border-border shadow-sm';
    }
  };

  const getCategoryIcon = (categoryName?: string) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('laptop')) return <Laptop className="w-4 h-4" />;
    if (name.includes('phone') || name.includes('mobile')) return <Smartphone className="w-4 h-4" />;
    if (name.includes('monitor') || name.includes('display')) return <Monitor className="w-4 h-4" />;
    if (name.includes('drive') || name.includes('storage')) return <HardDrive className="w-4 h-4" />;
    return <Cpu className="w-4 h-4" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-slate-50">
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tag</th>
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-transparent">
          {assets.map((asset, index) => (
            <motion.tr
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              key={asset.id}
              onClick={() => router.push(`/assets/${asset.id}`)}
              className="group hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 group-hover:shadow-sm transition-all border border-border">
                    {getCategoryIcon(asset.categoryId)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">{asset.name}</div>
                    <div className="text-xs text-slate-500">{asset.serialNumber || 'No Serial'}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className="font-mono text-sm text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-border">
                  {asset.tag}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-slate-600">{asset.categoryId || "Unknown"}</td>
              <td className="py-4 px-6">
                <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", getStatusStyle(String(asset.status)))}>
                  {String(asset.status || '').replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-slate-500">{asset.condition}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
