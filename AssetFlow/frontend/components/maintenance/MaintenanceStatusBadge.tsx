export default function MaintenanceStatusBadge({ status }: { status: string }) {
  let colors = "bg-slate-800 text-slate-400 border-slate-700";
  
  switch (status) {
    case "Pending":
      colors = "bg-amber-900/30 text-amber-400 border-amber-800/50";
      break;
    case "Approved":
      colors = "bg-blue-900/30 text-blue-400 border-blue-800/50";
      break;
    case "TechnicianAssigned":
      colors = "bg-indigo-900/30 text-indigo-400 border-indigo-800/50";
      break;
    case "InProgress":
      colors = "bg-purple-900/30 text-purple-400 border-purple-800/50";
      break;
    case "Resolved":
      colors = "bg-emerald-900/30 text-emerald-400 border-emerald-800/50";
      break;
    case "Rejected":
      colors = "bg-red-900/30 text-red-400 border-red-800/50";
      break;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors}`}>
      {status.replace(/([A-Z])/g, ' $1').trim()}
    </span>
  );
}
