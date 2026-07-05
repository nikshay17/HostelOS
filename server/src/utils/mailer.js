const axios = require('axios');

const getSender = () => ({
  email: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'noreply@hostelos.com',
  name: process.env.BREVO_SENDER_NAME || 'HostelOS',
});

const sendOTPEmail = async ({ to, name, otp }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const sender = getSender();
  const payload = {
    sender: {
      name: sender.name,
      email: sender.email,
    },
    to: [{ email: to, name }],
    subject: 'Your HostelOS verification code',
    htmlContent: `
      <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;">
        <div style="background:#4f46e5;padding:12px 20px;border-radius:10px;display:inline-block;margin-bottom:24px;">
          <span style="color:white;font-weight:700;font-size:16px;">HostelOS</span>
        </div>
        <h2 style="color:#111827;margin:0 0 8px;">Verify your account</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
          Hi ${name}, enter this code to complete your registration.
          It expires in 10 minutes.
        </p>
        <div style="background:#f5f3ff;border:2px solid #4f46e5;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
          <p style="font-size:40px;font-weight:900;letter-spacing:12px;color:#4f46e5;margin:0;font-family:monospace;">
            ${otp}
          </p>
        </div>
        <p style="color:#9ca3af;font-size:12px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('Email sent. Message ID:', response?.data?.messageId);
    return response.data;
  } catch (err) {
    const apiMessage = err.response?.data?.message || err.message;
    console.error('Brevo send failed:', apiMessage);
    throw new Error(`Brevo API error: ${apiMessage}`);
  }
};

module.exports = { sendOTPEmail };