import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgeittqmncltfzaiacis.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZWl0dHFtbmNsdGZ6YWlhY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTcyOTksImV4cCI6MjA4MDMzMzI5OX0.YboE9l2lcGS-49cxoWKLQn3XVzFnWw1aqQNPT3dM9Eo';

// Create Supabase client without auth persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey);