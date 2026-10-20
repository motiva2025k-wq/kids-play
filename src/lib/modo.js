// Ponto único de leitura das variáveis de ambiente do Supabase.
// Lê import.meta.env AQUI (e não em supabase.js) para evitar import circular:
// supabase.js importa de modo.js, nunca o contrário.
import { resolverModo } from './logica-modo.mjs'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const flagLocal = import.meta.env.VITE_MODO_LOCAL

const { modoLocal, supabaseConfigurado } = resolverModo({ url, anonKey, flagLocal })

export { url, anonKey, modoLocal, supabaseConfigurado }
