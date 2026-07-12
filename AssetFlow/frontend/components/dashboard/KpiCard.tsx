"use client";

import { motion } from "framer-motion";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
}

export default function KpiCard({ label, value, icon, trend }: KpiCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card p-6 relative overflow-hidden group cursor-pointer transition-shadow hover:shadow-float"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{label}</p>
          <div className="p-2 bg-primary-50 rounded-xl border border-primary-100 shadow-sm">
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">{value}</h2>
        </div>
        
        {trend && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shadow-sm">
              {trend}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
