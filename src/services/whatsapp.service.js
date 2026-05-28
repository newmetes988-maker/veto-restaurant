const twilio = require('twilio');
const env = require('../config/env');
const logger = require('../utils/logger');
const messageTemplateService = require('./messageTemplate.service');

/**
 * WhatsApp Service using Twilio API.
 * Sends reservation confirmations and updates to customers.
 * Supports editable message templates from the database.
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
   * Uses DB template if available, falls back to hardcoded message.
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

    let body;
    try {
      const template = await messageTemplateService.getTemplateByName('reservation_confirmed');
      if (template) {
        body = messageTemplateService.renderTemplate(template.body, {
          customer_name: reservation.customer_name,
          date,
          time,
          party_size: reservation.party_size,
          qr_url: qrPageUrl,
        });
      } else {
        body = this.buildFallbackConfirmationMessage({
          name: reservation.customer_name,
          date,
          time,
          partySize: reservation.party_size,
          qrPageUrl,
        });
      }
    } catch (err) {
      logger.warn('Failed to load confirmation template, using fallback', { error: err.message });
      body = this.buildFallbackConfirmationMessage({
        name: reservation.customer_name,
        date,
        time,
        partySize: reservation.party_size,
        qrPageUrl,
      });
    }

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
   * Uses DB template if available, falls back to hardcoded message.
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

    const templateName = status === 'rejected' ? 'reservation_rejected'
      : status === 'cancelled' ? 'reservation_cancelled'
      : null;

    let body;
    try {
      if (templateName) {
        const template = await messageTemplateService.getTemplateByName(templateName);
        if (template) {
          body = messageTemplateService.renderTemplate(template.body, {
            customer_name: reservation.customer_name,
            date,
            time,
          });
        } else {
          body = this.buildFallbackStatusMessage({ name: reservation.customer_name, date, time, status });
        }
      } else {
        body = this.buildFallbackStatusMessage({ name: reservation.customer_name, date, time, status });
      }
    } catch (err) {
      logger.warn('Failed to load status template, using fallback', { error: err.message });
      body = this.buildFallbackStatusMessage({ name: reservation.customer_name, date, time, status });
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
   * Fallback confirmation message (hardcoded).
   */
  buildFallbackConfirmationMessage({ name, date, time, partySize, qrPageUrl }) {
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

  /**
   * Fallback status update message (hardcoded).
   */
  buildFallbackStatusMessage({ name, date, time, status }) {
    if (status === 'rejected') {
      return `Hello ${name},\n\nWe regret to inform you that your reservation request for *${date} at ${time}* could not be accommodated.\n\nPlease contact us to explore alternative options.\n\nVeto Café & Restaurant 🧡`;
    }
    if (status === 'cancelled') {
      return `Hello ${name},\n\nYour reservation for *${date} at ${time}* has been cancelled as requested.\n\nWe hope to welcome you another time.\n\nVeto Café & Restaurant 🧡`;
    }
    return `Hello ${name},\n\nYour reservation status has been updated to: *${status.toUpperCase()}*\n\nDate: ${date} at ${time}\n\nVeto Café & Restaurant 🧡`;
  }
}

module.exports = new WhatsAppService();
