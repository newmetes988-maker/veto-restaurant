import React, { useState, useCallback, useMemo } from 'react';
import { validateReservation } from '../utils/validation';
import { useReservation } from '../hooks/useReservation';
import SuccessModal from './SuccessModal';
import { Clock, MapPin, Phone, Star, ChevronDown } from 'lucide-react';

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20];

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 11; h <= 22; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== 22) slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const getToday = () => new Date().toISOString().split('T')[0];
const getMaxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

const InputField = ({ label, error, icon, children, required }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-brand-400 uppercase tracking-wider">
      {label}
      {required && <span className="text-gold-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none">
          {icon}
        </div>
      )}
      {children}
    </div>
    {error && (
      <p className="text-red-400 text-xs flex items-center gap-1 animate-fade-in">
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const ReservationForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    scheduledDate: '',
    scheduledTime: '',
    partySize: '2',
    notes: '',
  });
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { submitReservation, isSubmitting, isSuccess, error, responseData, reset } = useReservation();

  const errors = useMemo(() => validateReservation(formData), [formData]);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const getFieldError = (field) => {
    if (!submitAttempted && !touched[field]) return null;
    return errors[field] || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;
    try {
      await submitReservation(formData);
    } catch {}
  };

  const handleReset = () => {
    setFormData({
      customerName: '', customerPhone: '', customerEmail: '',
      scheduledDate: '', scheduledTime: '', partySize: '2', notes: '',
    });
    setTouched({});
    setSubmitAttempted(false);
    reset();
  };

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.png"
            alt="Veto Restaurant Interior"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay - stronger on the right where the form is */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/70 via-brand-950/80 to-brand-950/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-transparent to-brand-950/50" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Hero Text */}
            <div className="text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
                <Star className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">Fine Dining Experience</span>
              </div>

              <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]">
                Book Your
                <span className="block text-gold-400">Table</span>
              </h2>

              <p className="text-brand-300 text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed mb-8">
                Experience culinary excellence at Veto. Reserve your spot for an unforgettable evening of fine dining, crafted cocktails, and impeccable service.
              </p>

              {/* Info badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-900/60 border border-brand-700/30 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span className="text-brand-300 text-sm">11:00 AM — 12:00 AM</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-900/60 border border-brand-700/30 backdrop-blur-sm">
                  <MapPin className="w-4 h-4 text-gold-400" />
                  <span className="text-brand-300 text-sm">Gleem Bay · Montaza</span>
                </div>
              </div>
            </div>

            {/* Right: Form Card */}
            <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <form
                onSubmit={handleSubmit}
                className="bg-brand-900/40 backdrop-blur-2xl border border-brand-700/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl shadow-black/40"
                noValidate
              >
                <div className="text-center mb-2">
                  <h3 className="font-serif text-xl text-white">Reservation Details</h3>
                  <p className="text-brand-500 text-xs mt-1">We will confirm your booking within 15 minutes</p>
                </div>

                {/* Name */}
                <InputField label="Full Name" error={getFieldError('customerName')} required>
                  <input
                    type="text" name="customerName"
                    value={formData.customerName}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. John Doe"
                    className="input-premium w-full"
                    disabled={isSubmitting}
                  />
                </InputField>

                {/* Contact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Phone" error={getFieldError('customerPhone') || getFieldError('contact')}>
                    <input
                      type="tel" name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="+20 10..."
                      className="input-premium w-full"
                      disabled={isSubmitting}
                    />
                  </InputField>
                  <InputField label="Email" error={getFieldError('customerEmail')}>
                    <input
                      type="email" name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="john@example.com"
                      className="input-premium w-full"
                      disabled={isSubmitting}
                    />
                  </InputField>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Date" error={getFieldError('scheduledDate')} required>
                    <input
                      type="date" name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange} onBlur={handleBlur}
                      min={getToday()} max={getMaxDate()}
                      className="input-premium w-full [color-scheme:dark]"
                      disabled={isSubmitting}
                    />
                  </InputField>
                  <InputField label="Time" error={getFieldError('scheduledTime')} required>
                    <div className="relative">
                      <select
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange} onBlur={handleBlur}
                        className="input-premium w-full appearance-none cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <option value="" disabled>Select time</option>
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot} className="bg-brand-900 text-white">{slot}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500 w-4 h-4" />
                    </div>
                  </InputField>
                </div>

                {/* Guests */}
                <InputField label="Guests" error={getFieldError('partySize')} required>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {GUEST_OPTIONS.map((num) => (
                      <button
                        key={num} type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, partySize: num.toString() }))}
                        className={`py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.partySize === num.toString()
                            ? 'bg-gold-500 text-brand-900 shadow-lg shadow-gold-500/20'
                            : 'bg-brand-800/40 text-brand-300 border border-brand-700/30 hover:bg-brand-700/50 hover:text-white'
                        }`}
                        disabled={isSubmitting}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </InputField>

                {/* Notes */}
                <InputField label="Special Requests (Optional)">
                  <textarea
                    name="notes" value={formData.notes}
                    onChange={handleChange} onBlur={handleBlur}
                    rows={2}
                    placeholder="Dietary restrictions, occasion, seating preference..."
                    className="input-premium w-full resize-none"
                    disabled={isSubmitting}
                  />
                </InputField>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center animate-fade-in">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gold-500 text-brand-900 font-semibold text-sm tracking-wide hover:bg-gold-400 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>Request Reservation</>
                  )}
                </button>

                <p className="text-center text-[11px] text-brand-600">
                  By reserving, you agree to our cancellation policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {isSuccess && <SuccessModal reservation={responseData} onClose={handleReset} />}
    </>
  );
};

export default ReservationForm;
