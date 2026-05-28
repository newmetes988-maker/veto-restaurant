import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { ChevronLeft, ChevronRight, Check, X, QrCode, Loader2 } from 'lucide-react';

const ReservationTable = ({
  reservations,
  meta,
  onPageChange,
  onStatusChange,
  isUpdating,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const canUpdate = (status) => ['pending', 'confirmed'].includes(status);

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-brand-700/50">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-800/80 text-brand-300 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-5 py-3.5 font-medium">Guest</th>
              <th className="px-5 py-3.5 font-medium">Contact</th>
              <th className="px-5 py-3.5 font-medium">Date & Time</th>
              <th className="px-5 py-3.5 font-medium">Guests</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-700/30">
            {reservations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-brand-500">
                  No reservations found.
                </td>
              </tr>
            )}
            {reservations.map((r) => (
              <tr
                key={r.id}
                className="bg-brand-800/20 hover:bg-brand-800/40 transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{r.customer_name}</div>
                  {r.notes && (
                    <div className="text-xs text-brand-500 mt-0.5 truncate max-w-[200px]">
                      {r.notes}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 text-brand-300">
                  <div>{r.customer_phone || '—'}</div>
                  <div className="text-xs text-brand-500">{r.customer_email || '—'}</div>
                </td>
                <td className="px-5 py-4 text-brand-200">
                  <div>{formatDate(r.scheduled_at)}</div>
                  <div className="text-xs text-brand-500">{formatTime(r.scheduled_at)}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-700/50 text-xs font-semibold text-white">
                    {r.party_size}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {r.qr_code && (
                      <button
                        onClick={() => setExpandedRow(expandedRow === r.id ? null : r.id)}
                        className="p-2 rounded-lg bg-brand-700/40 hover:bg-brand-700/70 text-brand-300 transition-colors"
                        title="View QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                    {canUpdate(r.status) && (
                      <>
                        <button
                          onClick={() => onStatusChange(r.id, 'confirmed')}
                          disabled={isUpdating === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {isUpdating === r.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Confirm
                        </button>
                        <button
                          onClick={() => onStatusChange(r.id, 'rejected')}
                          disabled={isUpdating === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {reservations.length === 0 && (
          <div className="text-center py-12 text-brand-500">No reservations found.</div>
        )}
        {reservations.map((r) => (
          <div
            key={r.id}
            className="glass-panel p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-white">{r.customer_name}</div>
                <div className="text-xs text-brand-400 mt-0.5">
                  {formatDate(r.scheduled_at)} · {formatTime(r.scheduled_at)}
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="text-sm text-brand-300 space-y-0.5">
              <div>Phone: {r.customer_phone || '—'}</div>
              <div>Email: {r.customer_email || '—'}</div>
              <div>Guests: {r.party_size}</div>
              {r.notes && <div className="text-brand-500 italic">"{r.notes}"</div>}
            </div>
            {canUpdate(r.status) && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onStatusChange(r.id, 'confirmed')}
                  disabled={isUpdating === r.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-sm font-medium"
                >
                  {isUpdating === r.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Confirm
                </button>
                <button
                  onClick={() => onStatusChange(r.id, 'rejected')}
                  disabled={isUpdating === r.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {expandedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setExpandedRow(null)}
        >
          <div
            className="glass-panel max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl text-white mb-4">Reservation QR</h3>
            <img
              src={`/api/v1/reservations/check-in/${reservations.find((r) => r.id === expandedRow)?.qr_code}`}
              alt="QR Code"
              className="w-48 h-48 mx-auto mb-4 bg-white rounded-xl p-2"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none' }} className="text-brand-400 text-sm mb-4">
              Token: {reservations.find((r) => r.id === expandedRow)?.qr_code}
            </div>
            <button onClick={() => setExpandedRow(null)} className="btn-secondary w-full">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-brand-500">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-2 rounded-lg bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-2 rounded-lg bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationTable;
