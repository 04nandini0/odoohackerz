import { create } from 'zustand';

export interface Allocation {
  id: string;
  assetId: string;
  holderId: string;
  holderType: 'Employee' | 'Department';
  allocatedAt: string;
  allocatedBy: string;
  expectedReturnDate: string | null;
  actualReturnDate: string | null;
  status: 'Active' | 'Returned';
  checkInNotes: string | null;
  checkInCondition: string | null;
}

export interface Transfer {
  id: string;
  allocationId: string;
  assetId: string;
  fromHolderId: string;
  toHolderId: string;
  toHolderType: 'Employee' | 'Department';
  status: 'Requested' | 'Approved' | 'Rejected';
  requestedBy: string;
  requestedAt: string;
  resolvedAt: string | null;
  rejectionReason: string | null;
}

interface AllocationState {
  allocations: Allocation[];
  transfers: Transfer[];
  overdue: Allocation[];
  loading: boolean;
  error: string | null;
  fetchAll: (status?: string) => Promise<void>;
  fetchOverdue: () => Promise<void>;
  fetchTransfers: (status?: string) => Promise<void>;
  allocate: (data: any) => Promise<void>;
  returnAsset: (id: string, data: any) => Promise<void>;
  requestTransfer: (data: any) => Promise<void>;
  approveTransfer: (id: string) => Promise<void>;
  rejectTransfer: (id: string, reason: string) => Promise<void>;
}

export const useAllocationStore = create<AllocationState>((set, get) => ({
  allocations: [],
  transfers: [],
  overdue: [],
  loading: false,
  error: null,

  fetchAll: async (status?: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const url = status ? `/api/allocations?status=${status}` : '/api/allocations';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch allocations');
      const data = await res.json();
      set({ allocations: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchOverdue: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/allocations/overdue', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch overdue');
      const data = await res.json();
      set({ overdue: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchTransfers: async (status?: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const url = status ? `/api/transfers?status=${status}` : '/api/transfers';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch transfers');
      const data = await res.json();
      set({ transfers: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  allocate: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData; // Throw structured error for frontend alert
      }
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message || 'Failed to allocate', loading: false });
      throw err; // Re-throw to be handled by the form component
    }
  },

  returnAsset: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/allocations/${id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to return asset');
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  requestTransfer: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to request transfer');
      await get().fetchTransfers();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  approveTransfer: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transfers/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to approve transfer');
      await get().fetchTransfers();
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  rejectTransfer: async (id: string, reason: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transfers/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: reason })
      });
      if (!res.ok) throw new Error('Failed to reject transfer');
      await get().fetchTransfers();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
