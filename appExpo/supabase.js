import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://rayvporphyeuhezsswyl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXZwb3JwaHlldWhlenNzd3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MjAwMDUsImV4cCI6MjA5MjI5NjAwNX0.d0kTc4zyQUeoLt4GUYs43qtsDPegLaXX-5PLqHJByTU';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXZwb3JwaHlldWhlenNzd3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcyMDAwNSwiZXhwIjoyMDkyIjk2MDA1fQ.ZWpEsE_r8iH5T0MPYeGGIhQu7HfBOUZUbyT3FIXDt5E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ADVERTENCIA: Esta instancia permite saltarse todas las políticas de seguridad.
// En una app real, esto DEBE estar en el backend, no en el código de la app móvil.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
