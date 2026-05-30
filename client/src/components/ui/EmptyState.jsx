import React from 'react';
import { CalendarX } from 'lucide-react';

export const EmptyState = ({ title = 'No reservations found', subtitle = 'Try adjusting your filters or search query.' }) => (
  <div className="glass-panel p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
      <CalendarX className="w-8 h-8 text-brand-500" />
    </div>
    <h3 className="text-white font-medium mb-2">{title}</h3>
    <p className="text-brand-500 text-sm">{subtitle}</p>
  </div>
);
