import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://rayvporphyeuhezsswyl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXZwb3JwaHlldWhlenNzd3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MjAwMDUsImV4cCI6MjA5MjI5NjAwNX0.d0kTc4zyQUeoLt4GUYs43qtsDPegLaXX-5PLqHJByTU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
