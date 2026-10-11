import { createClient } from '@supabase/supabase-js'

// Lê as chaves do arquivo .env.local (que NUNCA vai para o GitHub).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Se as chaves não existirem, o app mostra um aviso em vez de quebrar.
export const supabaseConfigurado = Boolean(url && anonKey)

export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null
