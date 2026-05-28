import React from 'react';

const SuccessModal = ({ reservation, onClose }) => {
  if (!reservation) return null;

  const date = new Date(reservation.scheduled_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = new Date(reservation.scheduled_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-panel max-w-md w-full p-8 text-center animate-slide-up">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="font-serif text-2xl text-white mb-2">Reservation Received</h2>
        <p className="text-brand-300 mb-6">
          Thank you, <span className="text-white font-medium">{reservation.customer_name}</span>.
          Your reservation request has been submitted.
        </p>

        <div className="bg-brand-800/50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-brand-400">Date</span>
            <span className="text-white font-medium">{date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-400">Time</span>
            <span className="text-white font-medium">{time}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-400">Guests</span>
            <span className="text-white font-medium">{reservation.party_size}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-400">Status</span>
            <span className="text-gold-400 font-medium capitalize">{reservation.status}</span>
          </div>
        </div>

        <p className="text-xs text-brand-400 mb-6">
          You will receive a confirmation via WhatsApp or email once approved.
        </p>

        <button onClick={onClose} className="btn-primary w-full">
          Make Another Reservation
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
