import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
const url = 'https://bjjxbaalewxioxesphjr.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || "YOUR_KEY_HERE"; 
// Wait, I can get the anon key from vite.
