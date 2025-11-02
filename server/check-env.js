import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the server directory
const result = dotenv.config({ path: join(__dirname, '.env') });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully');
}

console.log('\n=== Environment Variables ===');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET ✅' : 'NOT SET ❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✅' : 'NOT SET ❌');
console.log('PORT:', process.env.PORT || '5000 (default)');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `SET ✅ (${process.env.EMAIL_USER})` : 'NOT SET ❌');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET ✅ (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'NOT SET ❌');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:5173 (default)');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('\n⚠️  WARNING: Email variables are not set!');
  console.log('Please edit server/.env and replace:');
  console.log('  EMAIL_USER=your-email@gmail.com');
  console.log('  EMAIL_PASSWORD=your-app-password-here');
  console.log('\nWith your actual Gmail credentials.');
  console.log('\nTo get Gmail App Password:');
  console.log('1. Go to: https://myaccount.google.com/apppasswords');
  console.log('2. Generate App Password for "Mail"');
  console.log('3. Copy the 16-character password');
  console.log('4. Paste it in .env file as EMAIL_PASSWORD');
}

