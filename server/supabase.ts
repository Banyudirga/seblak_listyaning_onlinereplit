// Import environment variables first
import './env';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These environment variables need to be set in your production environment
const supabaseUrl = process.env.SUPABASE_URL || 'https://pbgfscevcxdnrwhzkhlx.supabase.co/rest/v1/';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZ2ZzY2V2Y3hkbnJ3aHpraGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTg3NTQsImV4cCI6MjA5NzUzNDc1NH0.Crthdv8w6JePKqZLZl9A1tTJJ_snaKvsXa0zcuPJgSI';


// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);