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
      className="glass-card p-6 relative overflow-hidden group cursor-pointer transition-shadow hover:shadow-primary-900/10"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">{label}</p>
          <div className="p-2 bg-surface-100/50 rounded-xl border border-white/5 shadow-inner shadow-white/5">
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-semibold text-white tracking-tight">{value}</h2>
        </div>
        
        {trend && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-inner shadow-emerald-500/5">
              {trend}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
