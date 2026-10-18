import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aktu_notes1965';
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_aktu_notes_1965_minimum_32_characters_key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const COOKIE_NAME = process.env.COOKIE_NAME || 'aktu_token';

// Security validation
if (NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be set and at least 32 characters in production.');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI must be provided in production.');
    process.exit(1);
  }
}
