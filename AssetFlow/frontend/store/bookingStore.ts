import { create } from 'zustand';

export interface Booking {
  id: string;
  resourceAssetId: string;
  bookedBy: string;
  startTime: string;
  endTime: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  purpose: string | null;
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchAll: (resourceAssetId?: string) => Promise<void>;
  createBooking: (data: any) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  rescheduleBooking: (id: string, data: any) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchAll: async (resourceAssetId?: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const url = resourceAssetId ? `/api/bookings?resourceAssetId=${resourceAssetId}` : '/api/bookings';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      set({ bookings: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createBooking: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData; // Throw structured error for overlap alert
      }
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message || 'Failed to create booking', loading: false });
      throw err;
    }
  },

  cancelBooking: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  rescheduleBooking: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message || 'Failed to reschedule booking', loading: false });
      throw err;
    }
  }
}));
