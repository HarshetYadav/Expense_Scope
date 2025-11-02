# Forgot Password Feature - Setup Guide

## Overview
The forgot password functionality has been successfully implemented. Users can now request a password reset via email and reset their password through a secure link.

## Features Implemented

### Backend
- ✅ Password reset token generation and storage
- ✅ Secure token hashing using SHA-256
- ✅ Email service using Nodemailer with Gmail SMTP
- ✅ Token expiration (1 hour)
- ✅ Password reset API endpoints

### Frontend
- ✅ Forgot Password page (`/forgot-password`)
- ✅ Reset Password page (`/reset-password/:token`)
- ✅ "Forgot Password" link on Login page
- ✅ User-friendly success/error messages

## Environment Variables Setup

To enable email functionality, you need to add the following environment variables to your `server/.env` file:

```env
# Existing variables (keep these)
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

# New variables for email functionality
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FRONTEND_URL=http://localhost:5173
```

### Gmail App Password Setup

Since Gmail requires App Passwords for third-party apps, follow these steps:

1. **Enable 2-Step Verification** on your Google account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification if not already enabled

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter "ExpenseScope" as the name
   - Click "Generate"
   - Copy the 16-character password (remove spaces)

3. **Add to .env file**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   Note: You can keep or remove spaces in the app password, nodemailer handles both.

4. **Set FRONTEND_URL**:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`

## API Endpoints

### POST `/api/auth/forgot-password`
Request body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

### POST `/api/auth/reset-password/:token`
Request body:
```json
{
  "password": "newpassword123"
}
```

Response:
```json
{
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

## How It Works

1. **User requests password reset**:
   - User clicks "Forgot your password?" on the login page
   - Enters their email address
   - System generates a secure token and sends it via email

2. **User receives email**:
   - Email contains a link with the reset token
   - Link format: `http://localhost:5173/reset-password/{token}`
   - Token expires in 1 hour

3. **User resets password**:
   - User clicks the link in the email
   - Enters new password and confirms it
   - Password is updated and user is redirected to login

## Security Features

- ✅ Tokens are hashed before storage (SHA-256)
- ✅ Tokens expire after 1 hour
- ✅ One-time use tokens (cleared after successful reset)
- ✅ Email existence not revealed (always returns success message)
- ✅ Password validation (minimum 6 characters)

## Testing

1. Start the server: `cd server && npm run dev`
2. Start the client: `cd client && npm run dev`
3. Navigate to login page
4. Click "Forgot your password?"
5. Enter a registered email address
6. Check email inbox for reset link
7. Click the link and reset password

## Troubleshooting

### Email not sending?
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Ensure Gmail App Password is set correctly
- Check server console for error messages
- Verify `FRONTEND_URL` is set correctly

### Token expired or invalid?
- Tokens expire after 1 hour
- User must request a new reset link
- Ensure the full token URL is copied correctly

### Email goes to spam?
- Check spam/junk folder
- Consider using a professional email service (SendGrid, Mailgun) for production

