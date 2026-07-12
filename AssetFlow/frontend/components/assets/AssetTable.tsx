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
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-rose-400 bg-rose-500/10 text-center font-medium border-b border-rose-500/20">Failed to load assets: {error}</div>;
  }

  if (assets.length === 0) {
    return <div className="p-12 text-center text-zinc-500">No assets found matching the criteria.</div>;
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-inner shadow-emerald-500/5';
      case 'Allocated': return 'bg-primary-500/10 text-primary-400 border-primary-500/20 shadow-inner shadow-primary-500/5';
      case 'InMaintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-inner shadow-amber-500/5';
      case 'Retired': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-inner shadow-rose-500/5';
      case 'Lost': return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-inner shadow-red-500/5';
      default: return 'bg-surface-100/50 text-zinc-400 border-white/10';
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
          <tr className="border-b border-white/5 bg-surface-100/30">
            <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Asset</th>
            <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tag</th>
            <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
            <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
            <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Condition</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-transparent">
          {assets.map((asset, index) => (
            <motion.tr
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              key={asset.id}
              onClick={() => router.push(`/assets/${asset.id}`)}
              className="group hover:bg-surface-100/50 transition-colors cursor-pointer"
            >
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-100/50 flex items-center justify-center text-zinc-400 group-hover:text-primary-400 group-hover:bg-primary-500/10 group-hover:shadow-inner group-hover:shadow-primary-500/10 transition-colors border border-white/5">
                    {getCategoryIcon(asset.categoryId)}
                  </div>
                  <div>
                    <div className="font-medium text-white group-hover:text-primary-400 transition-colors">{asset.name}</div>
                    <div className="text-xs text-zinc-500">{asset.serialNumber || 'No Serial'}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className="font-mono text-sm text-zinc-400 bg-surface-100/50 px-2.5 py-1 rounded-md border border-white/5">
                  {asset.tag}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-zinc-400">{asset.categoryId || "Unknown"}</td>
              <td className="py-4 px-6">
                <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", getStatusStyle(asset.status))}>
                  {asset.status.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-zinc-500">{asset.condition}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
