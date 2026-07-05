const nodemailer = require('nodemailer');

const mailPort = Number(process.env.EMAIL_PORT || 587);
const mailSecure = mailPort === 465;
const fallbackFrom = process.env.EMAIL_USER ? `HostelOS <${process.env.EMAIL_USER}>` : undefined;
const mailFrom = process.env.EMAIL_FROM && process.env.EMAIL_FROM.includes('@')
  ? process.env.EMAIL_FROM
  : fallbackFrom;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: mailPort,
  secure: mailSecure,
  requireTLS: !mailSecure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendOTPEmail = async ({ to, name, otp }) => {
  await transporter.sendMail({
    from: mailFrom,
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