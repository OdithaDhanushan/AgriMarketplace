const nodemailer = require('nodemailer');

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // 1. If SMTP credentials are configured in .env (e.g. Gmail / Brevo / Sendgrid)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || (process.env.SMTP_USER.includes('@gmail.com') ? 'gmail' : undefined),
      host: process.env.SMTP_HOST || undefined,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // 2. Fallback to Ethereal test account for development testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[MAILER] Ethereal test SMTP account configured.');
    return cachedTransporter;
  } catch (err) {
    console.log('[MAILER] Could not create Ethereal account, running in console mode:', err.message);
    return null;
  }
}

async function sendOtpEmail({ to, otp, orderNumber }) {
  const mailSubject = `[AgriMarketplace] Your Order Verification OTP: ${otp}`;
  const mailHtml = `
    <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #E5EAE6; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #2E7D32; color: #ffffff; padding: 22px 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">AgriMarketplace</h2>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Fresh Farm-to-Table Marketplace</p>
      </div>
      <div style="padding: 28px 24px; text-align: center;">
        <p style="font-size: 15px; color: #212121; margin: 0 0 10px;">
          Confirming your order <strong>#${orderNumber || 'AGRI'}</strong>
        </p>
        <p style="font-size: 14px; color: #68736B; margin: 0 0 20px; line-height: 1.5;">
          Please enter the following 4-digit verification code in the app to complete your order:
        </p>
        <div style="background-color: #EAF5EB; border: 2px dashed #2E7D32; border-radius: 12px; display: inline-block; padding: 14px 36px; margin: 8px 0 20px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #2E7D32;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #9AA09C; margin: 0; line-height: 1.4;">
          This OTP is valid for 10 minutes. If you did not make this request, please ignore this email.
        </p>
      </div>
      <div style="background-color: #F8F9FA; padding: 14px 20px; text-align: center; border-top: 1px solid #E5EAE6;">
        <p style="font-size: 11px; color: #68736B; margin: 0;">
          Direct connection between Sri Lankan farmers and buyers.
        </p>
      </div>
    </div>
  `;

  try {
    const transporter = await getTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"AgriMarketplace" <noreply@agrimarketplace.lk>',
        to,
        subject: mailSubject,
        html: mailHtml,
      });

      console.log(`\n========================================`);
      console.log(`[EMAIL DISPATCHED] OTP: ${otp} -> ${to}`);
      console.log(`Message ID: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`Preview URL: ${previewUrl}`);
      }
      console.log(`========================================\n`);

      return { success: true, messageId: info.messageId, previewUrl };
    }
  } catch (err) {
    console.error(`[MAILER ERROR] Could not send email to ${to}:`, err.message);
  }

  // Fallback console log for safety
  console.log(`\n========================================`);
  console.log(`[OTP VERIFICATION CODE FOR ${to}]: ${otp}`);
  console.log(`========================================\n`);
  return { success: true, localOnly: true, otp };
}

module.exports = {
  sendOtpEmail,
};
