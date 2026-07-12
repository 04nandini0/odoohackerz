"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAssetStore } from "@/store/assetStore";
import AssetStatusBadge from "@/components/assets/AssetStatusBadge";
import QRCodeDisplay from "@/components/assets/QRCodeDisplay";
import AssetHistoryTimeline from "@/components/assets/AssetHistoryTimeline";

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { currentAsset, fetchAssetById, isLoading, error } = useAssetStore();
  const assetId = params.id as string;

  useEffect(() => {
    if (assetId) {
      fetchAssetById(assetId);
    }
  }, [assetId, fetchAssetById]);

  if (isLoading) {
    return <div className="text-center py-8">Loading asset details...</div>;
  }

  if (error || !currentAsset) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error || "Asset not found"}</p>
        <button onClick={() => router.push('/assets')} className="mt-4 text-blue-600 underline">Back to Directory</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
          {currentAsset.name}
          <AssetStatusBadge status={currentAsset.status} />
        </h1>
        <button onClick={() => router.push('/assets')} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to Directory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Asset Tag</p>
                <p className="font-medium text-lg">{currentAsset.tag}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium">{currentAsset.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-medium">{currentAsset.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{currentAsset.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Acquisition Date</p>
                <p className="font-medium">{new Date(currentAsset.acquisitionDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Acquisition Cost</p>
                <p className="font-medium">${currentAsset.acquisitionCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Category Specific Details</h2>
            {Object.keys(currentAsset.customFieldValues).length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(currentAsset.customFieldValues).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-500">{key}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No custom fields for this asset.</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">History & Timeline</h2>
            <AssetHistoryTimeline assetId={assetId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4 self-start">QR Code</h2>
            <QRCodeDisplay assetId={assetId} />
            <p className="text-xs text-gray-500 mt-4 text-center">
              Scan to view asset details on mobile device
            </p>
          </div>

          {currentAsset.photoUrls && currentAsset.photoUrls.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Photos</h2>
              <div className="grid grid-cols-2 gap-2">
                {currentAsset.photoUrls.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt={`Asset photo ${idx}`} className="w-full h-24 object-cover rounded-md border" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
