"use client";

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Box, Calendar, Activity, LogOut, Wrench } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assets', href: '/assets', icon: Box },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Organization', href: '/organization', icon: Users },
  { name: 'Reports', href: '/reports', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-20 hover:w-64 group bg-white border-r border-border shadow-soft transition-all duration-300 z-50 overflow-hidden flex flex-col"
    >
      <div className="p-6 flex items-center gap-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0 shadow-sm shadow-primary-900/10">
          <span className="font-bold text-white tracking-tighter">AF</span>
        </div>
        <span className="font-bold text-lg text-slate-900 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          AssetFlow
        </span>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all relative group/item",
                isActive ? "text-primary-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-primary-50 rounded-xl border border-primary-100 shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("w-5 h-5 shrink-0 relative z-10", isActive && "text-primary-600")} />
              <span className="relative z-10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <button 
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
            Sign out
          </span>
        </button>
      </div>
    </motion.aside>
  );
}
