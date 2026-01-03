import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ahrlgflownywpcqjdwtp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocmxnZmxvd255d3BjcWpkd3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjY5NDAsImV4cCI6MjA4MTQwMjk0MH0.Bljv0vngn4_P4vlsQ1sj6A12PPtUwjaF7BAljtMjpk0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

