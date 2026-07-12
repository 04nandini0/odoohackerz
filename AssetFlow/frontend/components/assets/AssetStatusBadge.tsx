"use client";

interface AssetStatusBadgeProps {
  status: string;
}

export default function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Allocated": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Reserved": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "UnderMaintenance": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Lost": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Retired": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      case "Disposed": return "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeStyle()}`}>
      {status}
    </span>
  );
}
