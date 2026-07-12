"use client";

import { useEffect, useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { useAssetStore } from "@/store/assetStore";
import ResourceCalendar from "@/components/bookings/ResourceCalendar";
import BookingForm from "@/components/bookings/BookingForm";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter } from "lucide-react";

export default function BookingsPage() {
  const { bookings, fetchAll: fetchBookings } = useBookingStore();
  const { assets, fetchAssets } = useAssetStore();
  const [selectedResource, setSelectedResource] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchBookings();
  }, [fetchAssets, fetchBookings]);

  const bookableAssets = assets.filter(a => a.isBookable);
  
  const filteredBookings = selectedResource === "All" 
    ? bookings 
    : bookings.filter(b => b.resourceAssetId === selectedResource);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
            Resource Bookings
          </h1>
          <p className="text-slate-500">Schedule and manage bookable assets and conference rooms.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-5 py-2.5 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>New Booking</span>
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select 
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="w-full sm:w-64 bg-slate-50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none appearance-none"
              >
                <option value="All">All Resources</option>
                {bookableAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm"></div> Upcoming</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div> Ongoing</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm"></div> Completed</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div> Cancelled</div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-1 border border-border shadow-inner">
          <ResourceCalendar bookings={filteredBookings} />
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <BookingForm onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}