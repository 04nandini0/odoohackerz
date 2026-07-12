import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

interface Department {
  id: string;
  name: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  departmentHeadId?: string;
  departmentHeadName?: string;
  status: 'Active' | 'Inactive';
}

interface CustomField {
  fieldName: string;
  fieldType: 'text' | 'number' | 'date';
  required: boolean;
}

interface AssetCategory {
  id: string;
  name: string;
  customFields: CustomField[];
}

interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId?: string;
  departmentName?: string;
  role: string;
  status: 'Active' | 'Inactive';
}

interface OrganizationState {
  departments: Department[];
  assetCategories: AssetCategory[];
  employees: Employee[];
  isLoading: boolean;
  error: string | null;

  fetchDepartments: () => Promise<void>;
  createDepartment: (data: any) => Promise<void>;
  updateDepartment: (id: string, data: any) => Promise<void>;
  deactivateDepartment: (id: string) => Promise<void>;

  fetchAssetCategories: () => Promise<void>;
  createAssetCategory: (data: any) => Promise<void>;
  updateAssetCategory: (id: string, data: any) => Promise<void>;
  deleteAssetCategory: (id: string) => Promise<void>;

  fetchEmployees: (departmentId?: string, role?: string) => Promise<void>;
  toggleEmployeeStatus: (id: string, status: 'Active' | 'Inactive') => Promise<void>;
  promoteEmployee: (id: string, newRole: string) => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  departments: [],
  assetCategories: [],
  employees: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>('/departments');
      set({ departments: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch departments', isLoading: false });
    }
  },

  createDepartment: async (data) => {
    try {
      await apiClient.post<any>('/departments', data);
      await get().fetchDepartments();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create department');
    }
  },

  updateDepartment: async (id, data) => {
    try {
      await apiClient.put<any>(`/departments/${id}`, data);
      await get().fetchDepartments();
      await get().fetchEmployees(); // Because department names might change
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update department');
    }
  },

  deactivateDepartment: async (id) => {
    try {
      await apiClient.delete<any>(`/departments/${id}`);
      await get().fetchDepartments();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to deactivate department');
    }
  },

  fetchAssetCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>('/asset-categories');
      set({ assetCategories: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch asset categories', isLoading: false });
    }
  },

  createAssetCategory: async (data) => {
    try {
      await apiClient.post<any>('/asset-categories', data);
      await get().fetchAssetCategories();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create asset category');
    }
  },

  updateAssetCategory: async (id, data) => {
    try {
      await apiClient.put<any>(`/asset-categories/${id}`, data);
      await get().fetchAssetCategories();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update asset category');
    }
  },

  deleteAssetCategory: async (id) => {
    try {
      await apiClient.delete<any>(`/asset-categories/${id}`);
      await get().fetchAssetCategories();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete asset category');
    }
  },

  fetchEmployees: async (departmentId, role) => {
    set({ isLoading: true, error: null });
    try {
      let url = '/employees?';
      if (departmentId) url += `departmentId=${departmentId}&`;
      if (role) url += `role=${role}&`;
      
      const response = await apiClient.get<any>(url);
      set({ employees: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch employees', isLoading: false });
    }
  },

  toggleEmployeeStatus: async (id, status) => {
    try {
      await apiClient.put<any>(`/employees/${id}/status`, { status });
      await get().fetchEmployees();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to toggle employee status');
    }
  },

  promoteEmployee: async (id, newRole) => {
    try {
      await apiClient.post<any>(`/employees/${id}/promote`, { newRole });
      await get().fetchEmployees();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to promote employee');
    }
  }
}));