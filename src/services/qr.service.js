const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { randomUUID: uuidv4 } = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

const QR_DIR = path.join(process.cwd(), 'public', 'qr');

// Ensure directory exists
if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

/**
 * Generate a unique QR code for a reservation.
 * Saves PNG to disk and returns both token and public URL.
 */
const generateReservationQR = async (reservationId, baseUrl) => {
  const token = uuidv4();
  const publicBase = baseUrl || env.PUBLIC_BASE_URL || 'http://localhost:3000';
  const checkInUrl = `${publicBase}/qr/${token}`;
  const fileName = `${token}.png`;
  const filePath = path.join(QR_DIR, fileName);

  try {
    // Save PNG to disk
    await QRCode.toFile(filePath, checkInUrl, {
      type: 'png',
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#2b1a14',
        light: '#fdf8f6',
      },
    });

    // Also generate base64 for API response
    const qrDataUri = await QRCode.toDataURL(checkInUrl, {
      type: 'image/png',
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
    });

    const publicUrl = `${publicBase}/qr/${fileName}`;

    logger.info('QR code generated', { reservationId, token, path: filePath });

    return {
      token,
      checkInUrl,
      qrDataUri,
      publicUrl,
      filePath,
    };
  } catch (err) {
    logger.error('QR generation failed', { error: err.message, reservationId });
    throw err;
  }
};

module.exports = { generateReservationQR };
