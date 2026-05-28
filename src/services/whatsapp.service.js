const twilio = require('twilio');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * WhatsApp Service using Twilio API.
 * Sends reservation confirmations and updates to customers.
 */
class WhatsAppService {
  constructor() {
    this.isEnabled = !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM);

    if (this.isEnabled) {
      this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      logger.info('WhatsApp service initialized');
    } else {
      logger.warn('WhatsApp service disabled: missing Twilio credentials');
    }
  }

  /**
   * Format phone number to E.164 (WhatsApp requires this).
   * Adds + if missing.
   */
  formatPhone(phone) {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    return `+${cleaned}`;
  }

  /**
   * Send reservation confirmation with QR code page link.
   */
  async sendConfirmation({ to, reservation, qrPageUrl }) {
    if (!this.isEnabled) {
      logger.debug('WhatsApp skipped: service not configured');
      return null;
    }

    if (!to) {
      logger.debug('WhatsApp skipped: no customer phone');
      return null;
    }

    const toNumber = this.formatPhone(to);
    const fromNumber = env.TWILIO_WHATSAPP_FROM;

    const date = new Date(reservation.scheduled_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const time = new Date(reservation.scheduled_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const body = this.buildConfirmationMessage({
      name: reservation.customer_name,
      date,
      time,
      partySize: reservation.party_size,
      restaurantName: 'Veto Café & Restaurant',
      qrPageUrl,
    });

    try {
      const message = await this.client.messages.create({
        from: fromNumber,
        to: `whatsapp:${toNumber}`,
        body,
      });

      logger.info('WhatsApp confirmation sent', {
        sid: message.sid,
        to: toNumber,
        status: message.status,
      });

      return message;
    } catch (err) {
      logger.error('WhatsApp send failed', {
        error: err.message,
        code: err.code,
        to: toNumber,
      });
      return null;
    }
  }

  /**
   * Send status update (rejected, cancelled, etc.)
   */
  async sendStatusUpdate({ to, reservation, status }) {
    if (!this.isEnabled || !to) return null;

    const toNumber = this.formatPhone(to);
    const fromNumber = env.TWILIO_WHATSAPP_FROM;

    const date = new Date(reservation.scheduled_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const time = new Date(reservation.scheduled_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let body = '';
    if (status === 'rejected') {
      body = `Hello ${reservation.customer_name},\n\nWe regret to inform you that your reservation request for *${date} at ${time}* could not be accommodated.\n\nPlease contact us to explore alternative options.\n\nVeto Café & Restaurant 🧡`;
    } else if (status === 'cancelled') {
      body = `Hello ${reservation.customer_name},\n\nYour reservation for *${date} at ${time}* has been cancelled as requested.\n\nWe hope to welcome you another time.\n\nVeto Café & Restaurant 🧡`;
    } else {
      body = `Hello ${reservation.customer_name},\n\nYour reservation status has been updated to: *${status.toUpperCase()}*\n\nDate: ${date} at ${time}\nGuests: ${reservation.party_size}\n\nVeto Café & Restaurant 🧡`;
    }

    try {
      const message = await this.client.messages.create({
        from: fromNumber,
        to: `whatsapp:${toNumber}`,
        body,
      });

      logger.info('WhatsApp status update sent', {
        sid: message.sid,
        to: toNumber,
        status: message.status,
      });

      return message;
    } catch (err) {
      logger.error('WhatsApp status update failed', { error: err.message, to: toNumber });
      return null;
    }
  }

  /**
   * Build the confirmation message body.
   */
  buildConfirmationMessage({ name, date, time, partySize, restaurantName, qrPageUrl }) {
    return `🍽️ *Reservation Confirmed*\n\n` +
      `Hello ${name},\n\n` +
      `Your table at *Veto Café & Restaurant* is confirmed.\n\n` +
      `📅 *Date:* ${date}\n` +
      `🕐 *Time:* ${time}\n` +
      `👥 *Guests:* ${partySize}\n\n` +
      `📍 *Location:* Gleembay / Montaza, Alexandria\n\n` +
      `🎟️ *Your QR Code:*\n` +
      `${qrPageUrl}\n\n` +
      `Open the link to view and download your check-in QR code.\n\n` +
      `Need to modify? Reply here or call us.\n\n` +
      `Thank you! 🧡`;
  }
}

module.exports = new WhatsAppService();
