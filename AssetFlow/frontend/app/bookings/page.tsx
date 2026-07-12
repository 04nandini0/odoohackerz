"use client";

import { useEffect, useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { useAssetStore } from "@/store/assetStore";
import ResourceCalendar from "@/components/bookings/ResourceCalendar";
import BookingForm from "@/components/bookings/BookingForm";

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
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Resource Booking
          </h1>
          <p className="text-slate-400 mt-1">Schedule and manage bookable assets like conference rooms.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg font-medium shadow-lg shadow-teal-900/20 transition-all"
        >
          + New Booking
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-300">Filter by Resource:</label>
        <select 
          value={selectedResource}
          onChange={(e) => setSelectedResource(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-4 py-2"
        >
          <option value="All">All Resources</option>
          {bookableAssets.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex gap-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-900 border border-indigo-700"></div> Upcoming</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-900 border border-emerald-700"></div> Ongoing</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600"></div> Completed</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-900 border border-red-700"></div> Cancelled</div>
      </div>

      <ResourceCalendar bookings={filteredBookings} />

      {showForm && <BookingForm onClose={() => setShowForm(false)} />}
    </div>
  );
}