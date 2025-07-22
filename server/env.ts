// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Log environment variables to verify they're loaded
console.log('Environment variables loaded in env.ts:', {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY ? '[REDACTED]' : undefined,
});