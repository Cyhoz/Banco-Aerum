const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config(); <- Removido para evitar conflictos en Vercel

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Advertencia: SUPABASE_URL o SUPABASE_ANON_KEY no están definidos en el archivo .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = { supabase, supabaseAdmin };
