"use client";

import { useAssetStore } from "@/store/assetStore";
import { useEffect } from "react";

interface AssetHistoryTimelineProps {
  assetId: string;
}

export default function AssetHistoryTimeline({ assetId }: AssetHistoryTimelineProps) {
  const { history, fetchAssetHistory } = useAssetStore();

  useEffect(() => {
    fetchAssetHistory(assetId);
  }, [assetId, fetchAssetHistory]);

  if (history.length === 0) {
    return <div className="text-gray-500 text-sm italic">No history available for this asset.</div>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== history.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                    {/* Just a simple dot icon instead of lucide for now */}
                    <span className="h-2.5 w-2.5 bg-white rounded-full"></span>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">{event.action}</span>
                      <span className="block mt-1">{event.description}</span>
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={event.timestamp}>
                      {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
