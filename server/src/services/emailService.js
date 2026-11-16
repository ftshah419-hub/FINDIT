import { Resend } from 'resend';
import { ENV } from '../config/env.js';

let resendClient = null;
if (ENV.RESEND_API_KEY && ENV.RESEND_API_KEY !== 're_your_resend_api_key_here') {
  resendClient = new Resend(ENV.RESEND_API_KEY);
}

const renderEmailWrapper = (title, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F4F7FC; margin: 0; padding: 24px; color: #101C36; }
    .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #DCE4F0; padding: 32px; box-shadow: 0 4px 12px rgba(16,28,54,0.04); }
    .brand { font-size: 24px; font-weight: 800; color: #101C36; letter-spacing: -0.5px; margin-bottom: 24px; text-align: center; }
    .brand-accent { color: #2457E8; }
    .otp-box { background: #F4F7FC; border: 1.5px dashed #2457E8; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #101C36; margin: 24px 0; }
    .text { font-size: 14px; line-height: 1.6; color: #64748B; margin: 12px 0; }
    .footer { font-size: 12px; color: #94A3B8; text-align: center; margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">FIND<span class="brand-accent">IT</span></div>
    ${contentHtml}
    <div class="footer">
      If you did not request this email, please ignore it or contact system support.<br>
      &copy; ${new Date().getFullYear()} FINDIT Platform. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

export const emailService = {
  /**
   * Send verification OTP for registration
   */
  async sendVerificationOTP({ to, name, otp }) {
    const subject = `${otp} is your FINDIT verification code`;
    const html = renderEmailWrapper('Verify your email', `
      <h2 style="font-size: 20px; font-weight: 700; color: #101C36; margin-top: 0;">Verify your email address</h2>
      <p class="text">Hello ${name || 'there'},</p>
      <p class="text">Thank you for registering on FINDIT. Please enter the verification code below to confirm your email address and activate your account:</p>
      <div class="otp-box">${otp}</div>
      <p class="text">This code expires in <strong>10 minutes</strong>. For security reasons, never share this code with anyone.</p>
    `);

    return this._send({ to, subject, html, otp, purpose: 'EMAIL_VERIFICATION' });
  },

  /**
   * Send login OTP
   */
  async sendLoginOTP({ to, name, otp }) {
    const subject = `${otp} is your FINDIT login security code`;
    const html = renderEmailWrapper('Login Verification', `
      <h2 style="font-size: 20px; font-weight: 700; color: #101C36; margin-top: 0;">Two-Step Login Verification</h2>
      <p class="text">Hello ${name || 'User'},</p>
      <p class="text">A login attempt was initiated for your FINDIT account. Enter the 6-digit authentication code below to complete your sign-in:</p>
      <div class="otp-box">${otp}</div>
      <p class="text">This code is valid for <strong>10 minutes</strong>. If you did not initiate this login, your password may be compromised—please reset your password immediately.</p>
    `);

    return this._send({ to, subject, html, otp, purpose: 'LOGIN' });
  },

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP({ to, name, otp }) {
    const subject = `${otp} is your FINDIT password reset code`;
    const html = renderEmailWrapper('Reset your password', `
      <h2 style="font-size: 20px; font-weight: 700; color: #101C36; margin-top: 0;">Password Reset Request</h2>
      <p class="text">Hello ${name || 'User'},</p>
      <p class="text">We received a request to reset the password for your FINDIT account. Use the following code to verify your identity:</p>
      <div class="otp-box">${otp}</div>
      <p class="text">This code expires in <strong>10 minutes</strong>. If you did not make this request, you can safely disregard this message.</p>
    `);

    return this._send({ to, subject, html, otp, purpose: 'PASSWORD_RESET' });
  },

  /**
   * Internal sender with Resend or development fallback logger
   */
  async _send({ to, subject, html, otp, purpose }) {
    if (resendClient) {
      try {
        const { data, error } = await resendClient.emails.send({
          from: ENV.RESEND_FROM_EMAIL,
          to: [to],
          subject,
          html,
        });

        if (error) {
          console.error(`[Resend Error] Failed sending to ${to}:`, error);
          // In development mode, log OTP to console as fallback so work is never blocked
          if (ENV.NODE_ENV !== 'production') {
            this._logDevFallback(to, purpose, otp);
          }
          return { success: false, error };
        }

        return { success: true, messageId: data.id };
      } catch (err) {
        console.error(`[Email Service Exception] ${err.message}`);
        if (ENV.NODE_ENV !== 'production') {
          this._logDevFallback(to, purpose, otp);
        }
        return { success: false, error: err.message };
      }
    } else {
      // In development or when RESEND_API_KEY is not set, log clean visual banner to console
      this._logDevFallback(to, purpose, otp);
      return { success: true, simulated: true };
    }
  },

  _logDevFallback(to, purpose, otp) {
    console.log(`\n======================================================`);
    console.log(`[SIMULATED EMAIL via Resend Dev Fallback]`);
    console.log(`To:      ${to}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP:     >>> ${otp} <<<`);
    console.log(`Valid:   10 minutes`);
    console.log(`======================================================\n`);
  },
};
