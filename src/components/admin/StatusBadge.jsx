import React from 'react';

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  cancelled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  no_show: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        STATUS_STYLES[status] || STATUS_STYLES.pending
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export default StatusBadge;
