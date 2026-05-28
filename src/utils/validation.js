export const validateReservation = (values) => {
  const errors = {};

  // Name
  if (!values.customerName?.trim()) {
    errors.customerName = 'Full name is required';
  } else if (values.customerName.trim().length < 2) {
    errors.customerName = 'Name must be at least 2 characters';
  } else if (values.customerName.trim().length > 50) {
    errors.customerName = 'Name must be under 50 characters';
  }

  // Phone or Email (at least one)
  const hasPhone = values.customerPhone?.trim().length > 0;
  const hasEmail = values.customerEmail?.trim().length > 0;

  if (!hasPhone && !hasEmail) {
    errors.contact = 'Please provide a phone number or email';
  }

  if (hasEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email';
    }
  }

  if (hasPhone) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(values.customerPhone)) {
      errors.customerPhone = 'Please enter a valid phone number';
    }
  }

  // Date
  if (!values.scheduledDate) {
    errors.scheduledDate = 'Please select a date';
  } else {
    const selected = new Date(values.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.scheduledDate = 'Date cannot be in the past';
    }
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    if (selected > maxDate) {
      errors.scheduledDate = 'Reservations only available up to 30 days ahead';
    }
  }

  // Time
  if (!values.scheduledTime) {
    errors.scheduledTime = 'Please select a time';
  }

  // Guests
  const guests = parseInt(values.partySize, 10);
  if (!values.partySize || isNaN(guests)) {
    errors.partySize = 'Number of guests is required';
  } else if (guests < 1) {
    errors.partySize = 'At least 1 guest required';
  } else if (guests > 20) {
    errors.partySize = 'For parties over 20, please call us directly';
  }

  return errors;
};
