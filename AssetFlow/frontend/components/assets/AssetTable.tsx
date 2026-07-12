"use client";

import { useAssetStore } from "@/store/assetStore";
import AssetStatusBadge from "./AssetStatusBadge";
import { useRouter } from "next/navigation";

export default function AssetTable() {
  const router = useRouter();
  const { assets, isLoading } = useAssetStore();

  if (isLoading && assets.length === 0) {
    return <div className="text-center py-8 text-gray-500">Loading assets...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {assets.map((asset) => (
            <tr 
              key={asset.id} 
              onClick={() => router.push(`/assets/${asset.id}`)}
              className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</div>
                    <div className="text-sm text-gray-500">{asset.tag}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <AssetStatusBadge status={asset.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {asset.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {asset.condition}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {asset.departmentId || "Unassigned"}
              </td>
            </tr>
          ))}
          {assets.length === 0 && !isLoading && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No assets found matching the criteria.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
