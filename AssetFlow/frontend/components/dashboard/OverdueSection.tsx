import { format } from "date-fns";

export default function OverdueSection({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-5 mb-8">
      <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Action Required: Overdue Returns
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-slate-900/50 border border-red-900/30 p-3 rounded-lg">
            <div>
              <p className="font-medium text-slate-200">
                {item.type}: <span className="text-slate-400 font-normal">{item.assetId}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Holder: {item.holderId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-red-400">
                Due: {item.expectedReturn ? format(new Date(item.expectedReturn), 'MMM dd, yyyy HH:mm') : 'Unknown'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
