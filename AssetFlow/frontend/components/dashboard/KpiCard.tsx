export default function KpiCard({ label, value, icon, trend }: { label: string, value: number | string, icon?: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
          {trend && (
            <p className="text-xs font-medium text-emerald-400 mt-2">
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-slate-800/50 rounded-lg text-indigo-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
