# Quick Email Setup Guide

## ⚡ FAST FIX - Add These to Your .env File

1. Open `server/.env` file
2. Add these lines (replace with YOUR values):

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FRONTEND_URL=http://localhost:5173
```

## 🔑 How to Get Gmail App Password

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Enable it if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
   - (Or search "app passwords" in Google Account settings)
2. Select "Mail" from the dropdown
3. Select "Other (Custom name)"
4. Type: "ExpenseScope"
5. Click "Generate"
6. Copy the 16-character password (it looks like: `abcd efgh ijkl mnop`)
7. Paste it into `.env` as `EMAIL_PASSWORD`
   - You can include or remove spaces, both work

### Step 3: Update .env File
```env
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
FRONTEND_URL=http://localhost:5173
```

## ✅ Test Your Configuration

Run this command in the server folder:
```bash
node test-email.js
```

If successful, you'll see:
- ✅ Successfully connected to Gmail SMTP!
- ✅ Test email sent successfully!

If it fails, you'll see specific error messages to help fix it.

## 🔍 Common Errors

### Error: EAUTH (Authentication failed)
- **Solution**: Make sure you're using App Password, NOT your regular password
- Generate a new App Password at https://myaccount.google.com/apppasswords

### Error: EMAIL_USER not set
- **Solution**: Add `EMAIL_USER=your-email@gmail.com` to .env file

### Error: EMAIL_PASSWORD not set
- **Solution**: Add `EMAIL_PASSWORD=your-app-password` to .env file

## 📝 Example .env File

```env
# Database
MONGO_URI=mongodb://localhost:27017/expensescope
JWT_SECRET=your-secret-key-here

# Server
PORT=5000

# Email (Gmail)
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:5173
```

## 🚀 After Setup

1. Restart your server: `npm run dev`
2. Try the forgot password feature
3. Check your email inbox for the reset link

