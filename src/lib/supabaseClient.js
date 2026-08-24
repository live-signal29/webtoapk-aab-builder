import { createClient } from '@supabase/supabase-js';

// Fallback dummy credentials to prevent JavaScript runtime crashes
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://edijonltwbctrcknsghs.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_XcCe9sPEBpsRcVrP189tXg_qsM-5jPl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
