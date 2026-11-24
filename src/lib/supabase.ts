import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Normaliza caso seja colada a URL do painel do Supabase
let supabaseUrl = rawUrl.trim();
const dashboardMatch = supabaseUrl.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
if (dashboardMatch && dashboardMatch[1]) {
  supabaseUrl = `https://${dashboardMatch[1]}.supabase.co`;
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

