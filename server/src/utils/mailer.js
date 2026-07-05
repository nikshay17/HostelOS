const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async ({ to, name, otp }) => {
  await resend.emails.send({
    from: 'HostelOS <onboarding@resend.dev>',
    // ↑ Use this exact "from" address on free tier
    // Once you add a custom domain, change to: noreply@yourdomain.com
    to,
    subject: 'Verify your HostelOS account',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="background: #4f46e5; padding: 12px 16px; border-radius: 10px; display: inline-flex; margin-bottom: 24px;">
          <span style="color: white; font-weight: 700; font-size: 16px;">HostelOS</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 8px;">
          Verify your account
        </h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
          Hi ${name}, use the OTP below to verify your HostelOS account.
          It expires in 10 minutes.
        </p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; margin: 0;">
            ${otp}
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">
          If you did not register on HostelOS, ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };