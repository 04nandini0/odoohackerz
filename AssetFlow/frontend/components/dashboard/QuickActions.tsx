import Link from "next/link";

export default function QuickActions() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Link href="/assets/new" className="block w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-indigo-500/50">
          + Register New Asset
        </Link>
        <Link href="/bookings" className="block w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-teal-500/50">
          + Book a Resource
        </Link>
        <Link href="/maintenance" className="block w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-amber-500/50">
          + Raise Maintenance Request
        </Link>
      </div>
    </div>
  );
}
