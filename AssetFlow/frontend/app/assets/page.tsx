"use client";

import { useEffect } from "react";
import { useAssetStore } from "@/store/assetStore";
import AssetTable from "@/components/assets/AssetTable";
import AssetFilters from "@/components/assets/AssetFilters";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function AssetsPage() {
  const { fetchAssets } = useAssetStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const canRegister = user?.role === "Admin" || user?.role === "AssetManager";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">
            Assets Directory
          </h1>
          <p className="text-zinc-400">Manage and track your organization's assets.</p>
        </div>
        
        {canRegister && (
          <Link href="/assets/new">
            <button
              className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-4 py-2.5 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-900/20 hover:shadow-primary-600/30"
            >
              <Plus className="w-5 h-5" />
              <span>Register Asset</span>
            </button>
          </Link>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <AssetFilters />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <AssetTable />
      </motion.div>
    </div>
  );
}