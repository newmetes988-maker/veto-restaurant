import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
} from 'lucide-react';

const QRPage = () => {
  const { token } = useParams();
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await fetch(`/api/v1/reservations/by-qr/${token}`);
        const data = await res.json();
        if (data.status === 'success') {
          setReservation(data.data.reservation);
        } else {
          setError(data.message || 'Invalid or expired QR code');
        }
      } catch {
        setError('Failed to load reservation details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [token]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/qr/${token}.png`;
    link.download = `ristorante-Veto-qr-${token}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine reservation status based on date
  const getReservationStatus = (scheduledAt) => {
    const now = new Date();
    const resDate = new Date(scheduledAt);

    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const resDateOnly = new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate());

    if (resDateOnly.getTime() === nowDate.getTime()) {
      return 'active';
    } else if (resDateOnly.getTime() < nowDate.getTime()) {
      return 'expired';
    } else {
      return 'pending';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-900">
        <div className="animate-spin w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-900 px-4">
        <div className="glass-panel max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-serif text-xl text-white mb-2">Invalid QR Code</h2>
          <p className="text-brand-400 mb-6">{error}</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const status = getReservationStatus(reservation.scheduledAt);
  const date = new Date(reservation.scheduledAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const time = new Date(reservation.scheduledAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusConfig = {
    active: {
      color: 'emerald',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      icon: CheckCircle2,
      label: 'Active',
      sublabel: 'Valid for check-in today',
      message: 'Please present this QR code upon arrival.',
    },
    expired: {
      color: 'red',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      icon: XCircle,
      label: 'Expired',
      sublabel: 'Reservation date has passed',
      message: 'This reservation is no longer valid. Please make a new booking.',
    },
    pending: {
      color: 'amber',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      icon: AlertCircle,
      label: 'Pending',
      sublabel: 'Future reservation date',
      message: 'Your reservation is scheduled for a future date. Please contact management for assistance.',
    },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950 px-4 py-8 sm:py-12">
      <div className="max-w-md mx-auto space-y-5 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="font-serif text-2xl text-white mb-1">Veto Café & Restaurant</h1>
          <p className="text-brand-400 text-sm">Reservation Check-in</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl ${cfg.bg} border ${cfg.border} p-5 text-center`}>
          <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
            <StatusIcon className={`w-8 h-8 ${cfg.text}`} />
          </div>
          <h2 className={`font-serif text-2xl ${cfg.text} mb-1`}>{cfg.label}</h2>
          <p className="text-brand-300 text-sm mb-2">{cfg.sublabel}</p>
          <p className="text-brand-400 text-xs">{cfg.message}</p>
        </div>

        {/* Guest Info Card */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-medium text-brand-300 uppercase tracking-wider mb-3">Guest Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-brand-400">Name</span>
              <span className="text-white ml-auto font-medium">{reservation.customerName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-brand-400">Guests</span>
              <span className="text-white ml-auto font-medium">{reservation.partySize} people</span>
            </div>
          </div>
        </div>

        {/* Reservation Details Card */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-medium text-brand-300 uppercase tracking-wider mb-3">Reservation Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-brand-400">Date</span>
              <span className="text-white ml-auto font-medium">{date}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-brand-400">Time</span>
              <span className="text-white ml-auto font-medium">{time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-brand-400">Location</span>
              <span className="text-white ml-auto font-medium text-right">Gleembay / Montaza, Alexandria</span>
            </div>
          </div>
        </div>

        {/* QR Code Card (only show for active) */}
        {status === 'active' && (
          <div className="glass-panel p-6 text-center">
            <h2 className="font-serif text-lg text-white mb-1">Check-in QR Code</h2>
            <p className="text-brand-400 text-xs mb-5">Show this code upon arrival</p>

            <div className="bg-white rounded-2xl p-4 inline-block mb-5">
              <img
                src={`/qr/${token}.png`}
                alt="Reservation QR Code"
                className="w-56 h-56"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-56 h-56 flex items-center justify-center text-brand-900 font-medium">QR Not Found</div>';
                }}
              />
            </div>

            <button
              onClick={handleDownload}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>
          </div>
        )}

        {/* Contact Card (for expired or pending) */}
        {(status === 'expired' || status === 'pending') && (
          <div className="glass-panel p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-800/60 border border-brand-700/40 flex items-center justify-center">
              <Phone className="w-5 h-5 text-gold-400" />
            </div>
            <h3 className="text-white font-medium mb-1">Need Help?</h3>
            <p className="text-brand-400 text-sm mb-3">
              {status === 'expired'
                ? 'Please contact us to make a new reservation.'
                : 'Please contact management for assistance with your reservation.'}
            </p>
            <a
              href="tel:+20123456789"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              Call Restaurant
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2">
          <Link to="/" className="text-brand-400 hover:text-gold-400 text-sm transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Back to Reservation Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QRPage;
