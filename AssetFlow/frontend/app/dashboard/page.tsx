"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import KpiCard from "@/components/dashboard/KpiCard";
import OverdueSection from "@/components/dashboard/OverdueSection";
import QuickActions from "@/components/dashboard/QuickActions";
import { useAuthStore } from "@/store/authStore"; // Assuming an auth store exists to provide token
import { signalRClient } from "@/lib/signalr-client";

// In a real app you'd get the JWT from your auth store
const fetcher = (url: string) => fetch(url, {
  headers: {
    // We assume the auth interceptor attaches the token, or we grab it manually
    // For this mock, we assume credentials are sent or global fetch is patched
  }
}).then(res => res.json());

export default function DashboardPage() {
  const [token, setToken] = useState("");
  
  // This is a naive way to get token for SignalR. Usually it's in a state manager.
  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token) {
      signalRClient.connect(token);
    }
    return () => {
      // We don't disconnect on unmount of dashboard alone to keep notifications alive,
      // but typically you'd handle this in a global layout.
    };
  }, [token]);

  const { data: kpis, mutate: mutateKpis } = useSWR("/api/dashboard/kpis", fetcher, { 
    refreshInterval: 60000 // Fallback polling
  });
  
  const { data: overdueItems, mutate: mutateOverdue } = useSWR("/api/dashboard/overdue", fetcher);

  useEffect(() => {
    const handleDashboardStale = () => {
      mutateKpis();
      mutateOverdue();
    };

    window.addEventListener('dashboard-stale', handleDashboardStale);
    return () => window.removeEventListener('dashboard-stale', handleDashboardStale);
  }, [mutateKpis, mutateOverdue]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Overview of asset metrics and required actions.</p>
      </div>

      {overdueItems && overdueItems.length > 0 && (
        <OverdueSection items={overdueItems} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <KpiCard 
              label="Available Assets" 
              value={kpis?.assetsAvailable ?? "..."} 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            />
            <KpiCard 
              label="Allocated Assets" 
              value={kpis?.assetsAllocated ?? "..."} 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
            <KpiCard 
              label="Maintenance Today" 
              value={kpis?.maintenanceToday ?? "..."} 
              trend="Requires attention"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
            />
            <KpiCard 
              label="Active Bookings" 
              value={kpis?.activeBookings ?? "..."} 
            />
            <KpiCard 
              label="Pending Transfers" 
              value={kpis?.pendingTransfers ?? "..."} 
            />
            <KpiCard 
              label="Upcoming Returns" 
              value={kpis?.upcomingReturns ?? "..."} 
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}