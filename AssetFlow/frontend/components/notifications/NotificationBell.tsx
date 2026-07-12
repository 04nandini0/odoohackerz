"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NotificationBell() {
  const { data: notifications, mutate } = useSWR<any[]>("/api/notifications?unreadOnly=true", fetcher);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleNewNotification = () => mutate();
    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, [mutate]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    mutate();
  };

  const markAllAsRead = async () => {
    await fetch(`/api/notifications/read-all`, { method: "PUT" });
    mutate();
  };

  const unreadCount = notifications?.length || 0;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/50">
            <h3 className="font-semibold text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                You're all caught up!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {notifications?.map(notif => (
                  <div key={notif.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                    <p className="text-sm text-slate-300 mb-1">{notif.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Mark read
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link 
            href="/notifications" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-center text-sm font-medium text-indigo-400 hover:bg-slate-800 border-t border-slate-800"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
