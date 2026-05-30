import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  completed: '#3b82f6',
  rejected: '#ef4444',
  cancelled: '#8b5cf6',
  no_show: '#6b7280',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 text-sm border backdrop-blur-md"
        style={{ background: 'rgba(10,10,10,0.95)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }}
      >
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const StatusPieChart = ({ reservations }) => {
  const data = useMemo(() => {
    const counts = {};
    reservations.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || '#888',
    }));
  }, [reservations]);

  if (data.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl border backdrop-blur-sm"
      style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border-default)' }}
    >
      <h3 className="text-sm font-medium text-white mb-4">Reservations by Status</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.60)', fontSize: '12px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TimelineBarChart = ({ reservations }) => {
  const data = useMemo(() => {
    const counts = {};
    reservations.forEach((r) => {
      const date = new Date(r.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14);
  }, [reservations]);

  if (data.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl border backdrop-blur-sm"
      style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border-default)' }}
    >
      <h3 className="text-sm font-medium text-white mb-4">Reservations Over Time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.40)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.40)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" name="Reservations" fill="#d4af37" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
