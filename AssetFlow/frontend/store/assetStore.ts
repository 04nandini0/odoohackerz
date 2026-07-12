import { create } from 'zustand';
import apiClient from '@/lib/api-client';

export interface Asset {
  id: string;
  tag: string;
  name: string;
  categoryId: string;
  customFieldValues: Record<string, string>;
  serialNumber?: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  location: string;
  photoUrls: string[];
  documentUrls: string[];
  isBookable: boolean;
  status: 'Available' | 'Allocated' | 'Reserved' | 'UnderMaintenance' | 'Lost' | 'Retired' | 'Disposed';
  departmentId?: string;
}

interface AssetFilters {
  tag?: string;
  serialNumber?: string;
  categoryId?: string;
  status?: string;
  departmentId?: string;
  location?: string;
  search?: string;
}

interface AssetState {
  assets: Asset[];
  currentAsset: Asset | null;
  history: any[];
  isLoading: boolean;
  error: string | null;

  fetchAssets: (filters?: AssetFilters) => Promise<void>;
  fetchAssetById: (id: string) => Promise<void>;
  fetchAssetHistory: (id: string) => Promise<void>;
  createAsset: (data: any) => Promise<Asset>;
  updateAsset: (id: string, data: any) => Promise<Asset>;
  uploadPhoto: (id: string, file: File) => Promise<string>;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  currentAsset: null,
  history: [],
  isLoading: false,
  error: null,

  fetchAssets: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value as string);
      });
      
      const response = await apiClient.get(`/assets?${queryParams.toString()}`);
      set({ assets: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch assets', isLoading: false });
    }
  },

  fetchAssetById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/assets/${id}`);
      set({ currentAsset: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch asset', isLoading: false });
    }
  },

  fetchAssetHistory: async (id) => {
    try {
      const response = await apiClient.get(`/assets/${id}/history`);
      set({ history: response.data });
    } catch (error: any) {
      console.error('Failed to fetch history', error);
    }
  },

  createAsset: async (data) => {
    try {
      const response = await apiClient.post('/assets', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to register asset');
    }
  },

  updateAsset: async (id, data) => {
    try {
      const response = await apiClient.put(`/assets/${id}`, data);
      await get().fetchAssetById(id);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update asset');
    }
  },

  uploadPhoto: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/assets/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to upload photo');
    }
  }
}));
