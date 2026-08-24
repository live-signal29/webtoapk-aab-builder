import { createClient } from '@supabase/supabase-js';

// Fallback dummy credentials to prevent JavaScript runtime crashes
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
