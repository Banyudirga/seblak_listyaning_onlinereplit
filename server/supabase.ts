// Import environment variables first
import './env';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These environment variables need to be set in your production environment
const supabaseUrl = process.env.SUPABASE_URL || 'https://nalxmoworcikparifjyu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbHhtb3dvcmNpa3Bhcmlmanl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjU3NzYsImV4cCI6MjA2ODc0MTc3Nn0.g6DXOsRtuOftYCejvReMAUzyyeQv6HAYuqfizU4cFC8';


// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);