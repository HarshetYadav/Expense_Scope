import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Test email configuration
const testEmail = async () => {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'NOT SET');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ ERROR: EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
      process.exit(1);
    }

    // Remove spaces from password
    const emailPassword = process.env.EMAIL_PASSWORD.replace(/\s/g, '');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: emailPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Verifying connection to Gmail SMTP...');
    await transporter.verify();
    console.log('✅ Successfully connected to Gmail SMTP!');

    // Send a test email
    console.log('Sending test email...');
    const testEmail = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - ExpenseScope',
      text: 'This is a test email from ExpenseScope. If you receive this, your email configuration is working correctly!',
      html: '<p>This is a test email from ExpenseScope. If you receive this, your email configuration is working correctly!</p>'
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', testEmail.messageId);
    console.log('Check your inbox at:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.error('\n⚠️  AUTHENTICATION ERROR:');
      console.error('This usually means:');
      console.error('1. You are using your regular Gmail password instead of an App Password');
      console.error('2. The App Password is incorrect');
      console.error('3. 2-Step Verification is not enabled on your Google account');
      console.error('\nTo fix this:');
      console.error('1. Go to: https://myaccount.google.com/security');
      console.error('2. Enable 2-Step Verification');
      console.error('3. Go to: https://myaccount.google.com/apppasswords');
      console.error('4. Generate a new App Password for "Mail"');
      console.error('5. Copy the 16-character password (without spaces)');
      console.error('6. Add it to your .env file as EMAIL_PASSWORD');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n⚠️  CONNECTION ERROR:');
      console.error('Check your internet connection and try again.');
    } else {
      console.error('\nFull error:', error);
    }
    
    process.exit(1);
  }
};

testEmail();

