"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useOrganizationStore } from "@/store/organizationStore";
import DepartmentsTab from "@/components/organization/DepartmentsTab";
import AssetCategoriesTab from "@/components/organization/AssetCategoriesTab";
import EmployeeDirectoryTab from "@/components/organization/EmployeeDirectoryTab";

export default function OrganizationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"departments" | "categories" | "employees">("departments");

  const { fetchDepartments, fetchAssetCategories, fetchEmployees } = useOrganizationStore();

  useEffect(() => {
    if (user && user.role !== "Admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "Admin") {
      if (activeTab === "departments") fetchDepartments();
      if (activeTab === "categories") fetchAssetCategories();
      if (activeTab === "employees") fetchEmployees();
    }
  }, [activeTab, user?.role, fetchDepartments, fetchAssetCategories, fetchEmployees]);

  if (!user || user.role !== "Admin") return null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Setup</h1>
          <p className="text-gray-500 mt-2">Manage departments, asset categories, and your employee directory.</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("departments")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "departments"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "categories"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            Asset Categories
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "employees"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            Employee Directory
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "departments" && <DepartmentsTab />}
        {activeTab === "categories" && <AssetCategoriesTab />}
        {activeTab === "employees" && <EmployeeDirectoryTab />}
      </div>
    </div>
  );
}