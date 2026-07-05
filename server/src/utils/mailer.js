// mailer.js
const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const sendOTPEmail = async ({ to, name, otp }) => {
  const sendSmtpEmail = {
    to: [{ email: to, name }],
    sender: { email: 'noreply@hostelos.com', name: 'HostelOS' },
    // ↑ You can use any sender email on Brevo free tier
    subject: 'Your HostelOS verification code',
    htmlContent: `
      <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2>Verify your HostelOS account</h2>
        <p>Hi ${name}, your OTP is:</p>
        <div style="background:#f5f3ff;border-radius:12px;padding:24px;text-align:center;">
          <p style="font-size:40px;font-weight:900;letter-spacing:12px;color:#4f46e5;margin:0;font-family:monospace;">${otp}</p>
        </div>
        <p style="color:#9ca3af;font-size:12px;">Expires in 10 minutes.</p>
      </div>
    `,
  };

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent. Message ID:', result.body.messageId);
  } catch (err) {
    console.error('Brevo error:', err.message);
    throw err;
  }
};

module.exports = { sendOTPEmail };