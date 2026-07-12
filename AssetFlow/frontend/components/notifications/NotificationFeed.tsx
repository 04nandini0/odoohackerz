"use client";

import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NotificationFeed() {
  const { data: notifications, mutate } = useSWR<any[]>("/api/notifications", fetcher);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    mutate();
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case "MaintenanceApproved": 
      case "TransferApproved": 
      case "BookingConfirmed":
        return <div className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center">✓</div>;
      case "MaintenanceRejected":
      case "BookingCancelled":
        return <div className="w-8 h-8 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center">✕</div>;
      case "OverdueReturnAlert":
        return <div className="w-8 h-8 rounded-full bg-amber-900/50 text-amber-400 flex items-center justify-center">!</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-indigo-900/50 text-indigo-400 flex items-center justify-center">i</div>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="divide-y divide-slate-800/50">
        {notifications?.map(notif => (
          <div key={notif.id} className={`p-4 md:p-6 flex items-start gap-4 transition-colors ${notif.read ? 'bg-slate-900/50 opacity-70' : 'bg-slate-800/20'}`}>
            <div className="shrink-0 mt-1">
              {getIconForType(notif.type)}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-sm font-medium ${notif.read ? 'text-slate-400' : 'text-slate-200'}`}>
                  {notif.type.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className={`text-sm ${notif.read ? 'text-slate-500' : 'text-slate-300'}`}>
                {notif.message}
              </p>
              
              {!notif.read && (
                <button 
                  onClick={() => markAsRead(notif.id)}
                  className="mt-3 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
        {notifications?.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
