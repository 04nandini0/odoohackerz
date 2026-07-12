"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {!isAuthPage && <Sidebar />}
      
      <main className={`flex-1 h-screen overflow-y-auto relative ${!isAuthPage ? 'ml-20' : ''}`}>

        
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
