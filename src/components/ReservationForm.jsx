import React, { useState, useCallback, useMemo } from 'react';
import { validateReservation } from '../utils/validation';
import { useReservation } from '../hooks/useReservation';
import SuccessModal from './SuccessModal';

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
    <label className="block text-sm font-medium text-brand-300">
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
    } catch {
      // Error handled by hook
    }
  };

  const handleReset = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      scheduledDate: '',
      scheduledTime: '',
      partySize: '2',
      notes: '',
    });
    setTouched({});
    setSubmitAttempted(false);
    reset();
  };

  return (
    <>
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-10 animate-slide-up">
            <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-3">Reservations</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-white mb-4">
              Book Your Table
            </h2>
            <p className="text-brand-400 max-w-md mx-auto leading-relaxed">
              Enjoy a delightful buffet, café, and dining experience at Veto.
              Reserve your table and we will confirm shortly.
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="glass-panel p-6 sm:p-10 space-y-6 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
            noValidate
          >
            {/* Name */}
            <InputField
              label="Full Name"
              error={getFieldError('customerName')}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            >
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John Doe"
                className="input-premium pl-11"
                disabled={isSubmitting}
              />
            </InputField>

            {/* Contact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Phone Number"
                error={getFieldError('customerPhone') || getFieldError('contact')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              >
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+1 (234) 567-890"
                  className="input-premium pl-11"
                  disabled={isSubmitting}
                />
              </InputField>

              <InputField
                label="Email Address"
                error={getFieldError('customerEmail')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              >
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="john@example.com"
                  className="input-premium pl-11"
                  disabled={isSubmitting}
                />
              </InputField>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField label="Date" error={getFieldError('scheduledDate')} required>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={getToday()}
                  max={getMaxDate()}
                  className="input-premium [color-scheme:dark]"
                  disabled={isSubmitting}
                />
              </InputField>

              <InputField label="Time" error={getFieldError('scheduledTime')} required>
                <div className="relative">
                  <select
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="input-premium appearance-none cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>Select a time</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot} className="bg-brand-900 text-white">
                        {slot}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </InputField>
            </div>

            {/* Guests */}
            <InputField label="Number of Guests" error={getFieldError('partySize')} required>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {GUEST_OPTIONS.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, partySize: num.toString() }))}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.partySize === num.toString()
                        ? 'bg-gold-500 text-brand-900 shadow-lg shadow-gold-500/20'
                        : 'bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 hover:text-white'
                    }`}
                    disabled={isSubmitting}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </InputField>

            {/* Notes */}
            <InputField label="Special Requests (Optional)" error={null}>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Dietary restrictions, occasion, seating preference..."
                className="input-premium resize-none"
                disabled={isSubmitting}
              />
            </InputField>

            {/* Submit Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center animate-fade-in">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Request Reservation</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-center text-xs text-brand-500">
              By reserving, you agree to our cancellation policy. We will confirm within 15 minutes.
            </p>
          </form>
        </div>
      </section>

      {/* Success Modal */}
      {isSuccess && (
        <SuccessModal reservation={responseData} onClose={handleReset} />
      )}
    </>
  );
};

export default ReservationForm;
