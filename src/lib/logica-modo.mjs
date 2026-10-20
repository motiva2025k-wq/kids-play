// Lógica pura de detecção de modo. Sem import.meta.env aqui de propósito:
// isso permite testar com `node --test`, algo que import.meta.env não permite.

/**
 * Decide se o app roda em modo local ou contra o Supabase.
 *
 * @param {object} p
 * @param {string} [p.url]       VITE_SUPABASE_URL
 * @param {string} [p.anonKey]   VITE_SUPABASE_ANON_KEY
 * @param {string} [p.flagLocal] VITE_MODO_LOCAL ('1' ativa)
 * @returns {{ modoLocal: boolean, supabaseConfigurado: boolean }}
 */
export function resolverModo({ url, anonKey, flagLocal } = {}) {
  const temChaves = Boolean(url && anonKey)
  const explicito = flagLocal === '1'

  return {
    // Sem flag e sem chaves também caímos no local: é o que acontece para
    // quem clona o projeto e ainda não configurou nada.
    modoLocal: explicito || !temChaves,
    // A flag vence sobre as chaves: é o que permite testar offline sem
    // apagar o .env.local real.
    supabaseConfigurado: temChaves && !explicito,
  }
}
