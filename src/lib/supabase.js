import { createClient } from '@supabase/supabase-js'
import { url, anonKey, modoLocal } from './modo.js'

// No modo local isto fica `null`, mesmo com chaves no .env.local. É o que
// garante que nenhuma requisição de rede seja feita.
export const supabase = !modoLocal && url && anonKey ? createClient(url, anonKey) : null
