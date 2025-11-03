import nodemailer from 'nodemailer';

// Build SMTP transport options based on env and a secure preference
const buildTransportOptions = (preferSecure) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || (preferSecure ? 465 : 587));
  const smtpSecure = typeof process.env.SMTP_SECURE !== 'undefined'
    ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
    : preferSecure; // default secure for 465

  // Remove spaces from password if present (Gmail App Passwords sometimes have spaces)
  const emailPassword = (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '').replace(/\s/g, '');

  return {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    service: process.env.SMTP_SERVICE || (smtpHost === 'smtp.gmail.com' ? 'gmail' : undefined),
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: emailPassword,
    },
    // Timeouts to avoid hanging in PaaS environments (e.g., Render)
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000), // 20s
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
    tls: {
      // In production, prefer strict TLS; allow opting out in development
      rejectUnauthorized: String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || (process.env.NODE_ENV === 'production' ? 'true' : 'false')).toLowerCase() === 'true'
    }
  };
};

// Create transporter using preferred config (with graceful fallback)
const createTransporter = async () => {
  // Check if required environment variables are set
  const userSet = Boolean(process.env.SMTP_USER || process.env.EMAIL_USER);
  const passSet = Boolean(process.env.SMTP_PASS || process.env.EMAIL_PASSWORD);
  if (!userSet || !passSet) {
    throw new Error('EMAIL_USER/SMTP_USER and EMAIL_PASSWORD/SMTP_PASS must be set in environment variables. Please edit server/.env and add your credentials. See EMAIL_SETUP_GUIDE.md for instructions.');
  }

  // Check if using placeholder values
  if (
    (process.env.SMTP_USER === 'your-email@gmail.com' || process.env.EMAIL_USER === 'your-email@gmail.com') ||
    (process.env.SMTP_PASS === 'your-app-password-here' || process.env.EMAIL_PASSWORD === 'your-app-password-here')
  ) {
    throw new Error('Please replace placeholder values in server/.env with real credentials. For Gmail, use an App Password: https://myaccount.google.com/apppasswords');
  }

  const primaryOptions = buildTransportOptions(false); // try 587 first
  const fallbackOptions = buildTransportOptions(true);  // then 465 secure

  // Try primary (likely 587). If connection times out/blocked, retry with 465.
  let lastError;
  for (const opts of [primaryOptions, fallbackOptions]) {
    try {
      const transporter = nodemailer.createTransport(opts);
      await transporter.verify();
      return transporter;
    } catch (error) {
      lastError = error;
      // Only continue to fallback on connection-level issues
      if (!(error && (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION' || error.command === 'CONN'))) {
        throw error;
      }
    }
  }

  // If both attempts failed, throw the last error
  throw lastError || new Error('Failed to create SMTP transporter');
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - ExpenseScope',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You have requested to reset your password for your ExpenseScope account.
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Click the button below to reset your password. This link will expire in 1 hour.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #4F46E5; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
          </div>
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            © ${new Date().getFullYear()} ExpenseScope. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your EMAIL_USER and EMAIL_PASSWORD in .env file. Make sure you are using a Gmail App Password, not your regular password.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Failed to connect to email server. Please check your internet connection.');
    } else if (error.code === 'ETIMEDOUT' || error.command === 'CONN') {
      throw new Error('Failed to connect to email server (timeout). Some hosting providers block port 587. We automatically retried 465 but it still failed. Consider using a transactional email provider (e.g., SendGrid, Resend) or set SMTP_HOST/PORT in .env.');
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
};

