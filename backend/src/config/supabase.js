const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Advertencia: SUPABASE_URL o SUPABASE_ANON_KEY no están definidos en el archivo .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
