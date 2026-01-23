import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nestlfcrayxktwqrpdht.supabase.co';
const supabaseKey = 'sb_publishable_GhTWp32h3SULJfNGTWk2QA_FLkVhuOt';

export const supabase = createClient(supabaseUrl, supabaseKey);
