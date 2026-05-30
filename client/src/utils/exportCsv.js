export const exportReservationsToCsv = (reservations, filename = 'reservations.csv') => {
  if (!reservations || reservations.length === 0) return;

  const headers = ['ID', 'Guest Name', 'Phone', 'Email', 'Party Size', 'Date', 'Time', 'Status', 'Notes', 'Created At'];

  const rows = reservations.map((r) => [
    r.id,
    r.customer_name || '',
    r.customer_phone || '',
    r.customer_email || '',
    r.party_size || '',
    r.scheduled_at ? new Date(r.scheduled_at).toLocaleDateString() : '',
    r.scheduled_at ? new Date(r.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    r.status || '',
    r.notes || '',
    r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
  ]);

  const escapeCsv = (cell) => {
    const str = String(cell || '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
