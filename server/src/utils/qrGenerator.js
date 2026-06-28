const QRCode = require('qrcode');

// Generates a QR code as a base64 data URL encoding the gate pass ID + a verification token
const generateQR = async (gatePassId) => {
  const payload = JSON.stringify({ gatePassId, issuedAt: Date.now() });
  try {
    const qrDataUrl = await QRCode.toDataURL(payload);
    return qrDataUrl; // e.g. "data:image/png;base64,iVBORw0KGgo..."
  } catch (err) {
    throw new Error('Failed to generate QR code');
  }
};

module.exports = generateQR;