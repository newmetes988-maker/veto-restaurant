import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const useReservation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [responseData, setResponseData] = useState(null);

  const submitReservation = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Combine date + time into ISO string
      const scheduledAt = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      ).toISOString();

      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone?.trim() || undefined,
        customerEmail: formData.customerEmail?.trim() || undefined,
        partySize: parseInt(formData.partySize, 10),
        scheduledAt,
        notes: formData.notes?.trim() || undefined,
      };

      const res = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setResponseData(data.data?.reservation);
      setIsSuccess(true);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
    setResponseData(null);
  };

  return {
    submitReservation,
    isSubmitting,
    isSuccess,
    error,
    responseData,
    reset,
  };
};
