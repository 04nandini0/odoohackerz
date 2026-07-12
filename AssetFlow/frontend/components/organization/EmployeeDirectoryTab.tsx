"use client";

import { useState } from "react";
import { useOrganizationStore } from "@/store/organizationStore";
import PromoteEmployeeDialog from "./PromoteEmployeeDialog";

export default function EmployeeDirectoryTab() {
  const { employees, departments, toggleEmployeeStatus, isLoading, error } = useOrganizationStore();
  
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [promotingEmployeeId, setPromotingEmployeeId] = useState<string | null>(null);

  const filteredEmployees = employees.filter(emp => {
    if (selectedDept && emp.departmentId !== selectedDept) return false;
    if (selectedRole && emp.role !== selectedRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!emp.name.toLowerCase().includes(q) && !emp.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-purple-100 text-purple-800";
      case "DepartmentHead": return "bg-indigo-100 text-indigo-800";
      case "AssetManager": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-xl font-semibold">Employee Directory</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="DepartmentHead">Department Head</option>
            <option value="AssetManager">Asset Manager</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</div>
                  <div className="text-sm text-gray-500">{emp.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">{emp.departmentName || <span className="text-gray-400 italic">None</span>}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(emp.role)}`}>
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {emp.role !== "Admin" ? (
                    <button
                      onClick={() => toggleEmployeeStatus(emp.id, emp.status === "Active" ? "Inactive" : "Active")}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${emp.status === 'Active' ? 'bg-blue-600' : 'bg-gray-200'}`}
                      role="switch"
                      aria-checked={emp.status === 'Active'}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${emp.status === 'Active' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">Master</span>
                  )}
                  <span className="ml-2 text-sm text-gray-500">{emp.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {emp.role === "Employee" && emp.status === "Active" && (
                    <button 
                      onClick={() => setPromotingEmployeeId(emp.id)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Promote
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {promotingEmployeeId && (
        <PromoteEmployeeDialog
          employeeId={promotingEmployeeId}
          employeeName={employees.find(e => e.id === promotingEmployeeId)?.name || ""}
          onClose={() => setPromotingEmployeeId(null)}
        />
      )}
    </div>
  );
}
