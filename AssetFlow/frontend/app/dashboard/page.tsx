"use client";

import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import KpiCard from "@/components/dashboard/KpiCard";
import { Box, Calendar, AlertTriangle, Users } from "lucide-react";
import { motion, Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: kpis, error, isLoading } = useSWR<any>("/dashboard/kpis", fetcher);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl shadow-sm">
          Failed to load dashboard data. Are you sure you are logged in?
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-1 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500">Welcome back, {user?.name}</p>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <KpiCard 
            label="Available Assets" 
            value={kpis?.assetsAvailable || kpis?.availableAssets || 0} 
            icon={<Box className="w-6 h-6 text-emerald-600" />} 
          />
        </motion.div>
        
        <motion.div variants={item}>
          <KpiCard 
            label="Active Bookings" 
            value={kpis?.activeBookings || 0} 
            icon={<Calendar className="w-6 h-6 text-primary-600" />} 
          />
        </motion.div>

        <motion.div variants={item}>
          <KpiCard 
            label="Pending Maintenance" 
            value={kpis?.maintenanceToday || kpis?.pendingMaintenance || 0} 
            icon={<AlertTriangle className="w-6 h-6 text-amber-500" />} 
            trend="Requires attention"
          />
        </motion.div>

        <motion.div variants={item}>
          <KpiCard 
            label="Allocated Assets" 
            value={kpis?.assetsAllocated || kpis?.totalEmployees || 0} 
            icon={<Users className="w-6 h-6 text-purple-600" />} 
          />
        </motion.div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Asset Utilization Trend</h3>
          <div className="w-full h-[300px] flex items-center justify-center border border-border rounded-xl bg-slate-50 border-dashed">
            <span className="text-slate-400">Visualization Placeholder</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-border">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary-600 shrink-0 shadow-sm" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Asset checked out</p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}