import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : new Proxy({} as any, {
        get: () => {
            throw new Error("Supabase keys are missing! Please check your GitHub Secrets (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
        }
    });
