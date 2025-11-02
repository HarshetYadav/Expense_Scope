import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP
const createTransporter = () => {
  // Check if required environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set in environment variables. Please edit server/.env file and add your Gmail credentials. See EMAIL_SETUP_GUIDE.md for instructions.');
  }

  // Check if using placeholder values
  if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASSWORD === 'your-app-password-here') {
    throw new Error('Please replace the placeholder values in server/.env file with your actual Gmail credentials. EMAIL_USER should be your Gmail address, and EMAIL_PASSWORD should be a Gmail App Password (not your regular password). Get App Password from: https://myaccount.google.com/apppasswords');
  }

  // Remove spaces from password if present (Gmail App Passwords sometimes have spaces)
  const emailPassword = process.env.EMAIL_PASSWORD.replace(/\s/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: emailPassword,
    },
    tls: {
      rejectUnauthorized: false // For development, you might need this
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const transporter = createTransporter();

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

    // Verify connection first
    await transporter.verify();
    console.log('Email server is ready to send messages');

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
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
};

