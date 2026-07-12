export default function MaintenanceStatusBadge({ status }: { status: string }) {
  let colors = "bg-surface-100/50 text-zinc-400 border-white/10";
  
  switch (status) {
    case "Pending":
      colors = "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)]";
      break;
    case "Approved":
      colors = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[inset_0_0_8px_rgba(99,102,241,0.15)]";
      break;
    case "TechnicianAssigned":
      colors = "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[inset_0_0_8px_rgba(59,130,246,0.15)]";
      break;
    case "InProgress":
      colors = "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[inset_0_0_8px_rgba(168,85,247,0.15)]";
      break;
    case "Resolved":
      colors = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]";
      break;
    case "Rejected":
      colors = "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[inset_0_0_8px_rgba(244,63,94,0.15)]";
      break;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${colors}`}>
      {status.replace(/([A-Z])/g, ' $1').trim()}
    </span>
  );
}
