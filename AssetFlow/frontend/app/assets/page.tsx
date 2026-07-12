"use client";

import { useEffect } from "react";
import { useAssetStore } from "@/store/assetStore";
import AssetTable from "@/components/assets/AssetTable";
import AssetFilters from "@/components/assets/AssetFilters";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function AssetsPage() {
  const { fetchAssets } = useAssetStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const canRegister = user?.role === "Admin" || user?.role === "AssetManager";

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets Directory</h1>
        {canRegister && (
          <Link
            href="/assets/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
          >
            + Register Asset
          </Link>
        )}
      </div>

      <AssetFilters />
      <AssetTable />
    </div>
  );
}