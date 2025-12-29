import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'example-key'

// Aviso no console se as credenciais não estiverem configuradas
if (supabaseUrl === 'https://example.supabase.co' || supabaseAnonKey === 'example-key') {
  console.warn(
    '⚠️ ATENÇÃO: Supabase não configurado!\n\n' +
    'Para usar todas as funcionalidades:\n' +
    '1. Crie um projeto em https://supabase.com\n' +
    '2. Execute o SQL em dataBases/schema_saude.sql\n' +
    '3. Configure as variáveis no arquivo .env\n' +
    '4. Reinicie o servidor\n\n' +
    'Por enquanto, você pode visualizar a interface com dados de exemplo.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
