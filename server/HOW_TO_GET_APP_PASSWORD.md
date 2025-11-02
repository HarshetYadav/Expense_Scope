# How to Get Gmail App Password - Step by Step

## Why App Password?
Google doesn't allow third-party apps (like our server) to use your regular Gmail password for security reasons. Instead, you need to generate a special "App Password" that works only for email sending.

## Step-by-Step Instructions

### Step 1: Enable 2-Step Verification (if not already enabled)
1. Go to: https://myaccount.google.com/security
2. Scroll down to "How you sign in to Google"
3. Click on "2-Step Verification"
4. If it's OFF, click "Get Started" and follow the steps to enable it
5. **Note:** You MUST have 2-Step Verification enabled to generate App Passwords

### Step 2: Generate App Password
1. Go directly to: https://myaccount.google.com/apppasswords
   - OR go to: https://myaccount.google.com/security
   - Scroll down and click "App passwords" (below "2-Step Verification")

2. You'll see a page asking:
   - **Select app:** Choose "Mail"
   - **Select device:** Choose "Other (Custom name)"
   - **Enter name:** Type "ExpenseScope" or "Password Reset" (any name you want)
   - Click "Generate"

3. Google will show you a 16-character password like:
   ```
   abcd efgh ijkl mnop
   ```
   OR
   ```
   abcdefghijklmnop
   ```

4. **Copy this password** - you won't be able to see it again!

### Step 3: Add to .env File
Open `server/.env` and set:

```env
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Important:**
- Use your **actual Gmail address** (the one you login with)
- Use the **App Password** you just copied (not your regular password)
- You can remove spaces from the App Password if it has them - both work

### Step 4: Example
If your email is `john.doe@gmail.com` and your App Password is `abcd efgh ijkl mnop`, your .env should have:

```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

OR with spaces (also works):

```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

## Visual Example

```
Before (Wrong):
EMAIL_USER=your-email@gmail.com          ❌ Placeholder
EMAIL_PASSWORD=your-app-password-here   ❌ Placeholder

After (Correct):
EMAIL_USER=john.doe@gmail.com           ✅ Your actual Gmail
EMAIL_PASSWORD=abcdefghijklmnop          ✅ App Password from Google
```

## Quick Check

After setting up, test it:
```bash
node test-email.js
```

If successful, you'll receive a test email at your Gmail address!

## Troubleshooting

**Error: "App passwords aren't available for this account"**
- Solution: Enable 2-Step Verification first (Step 1 above)

**Error: "Invalid login"**
- Solution: Make sure you're using the App Password, not your regular password

**Error: "EMAIL_USER not set"**
- Solution: Check that .env file exists in the `server` folder and has EMAIL_USER line

**Error: "EMAIL_PASSWORD not set"**
- Solution: Make sure EMAIL_PASSWORD is on a new line in .env file

