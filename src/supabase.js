// Supabase client for Orbit.
// Reads credentials from environment variables (set in Vercel dashboard as
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY). When they are absent,
// `supabase` is null and the app runs in local demo mode.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isCloud = !!supabase;
