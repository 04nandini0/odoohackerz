import NotificationFeed from "@/components/notifications/NotificationFeed";

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Notifications
        </h1>
        <p className="text-slate-400 mt-1">Stay updated on your asset allocations, bookings, and requests.</p>
      </div>

      <NotificationFeed />
    </div>
  );
}