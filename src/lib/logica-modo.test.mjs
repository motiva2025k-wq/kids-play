import test from 'node:test'
import assert from 'node:assert/strict'
import { resolverModo } from './logica-modo.mjs'

test('sem chaves e sem flag: cai no modo local', () => {
  const r = resolverModo({ url: undefined, anonKey: undefined, flagLocal: undefined })
  assert.equal(r.modoLocal, true)
  assert.equal(r.supabaseConfigurado, false)
})

test('com chaves e sem flag: mantém o Supabase (comportamento publicado)', () => {
  const r = resolverModo({ url: 'https://x.supabase.co', anonKey: 'k', flagLocal: undefined })
  assert.equal(r.modoLocal, false)
  assert.equal(r.supabaseConfigurado, true)
})

test('flag = 1 com chaves presentes: força o modo local e DESLIGA o Supabase', () => {
  const r = resolverModo({ url: 'https://x.supabase.co', anonKey: 'k', flagLocal: '1' })
  assert.equal(r.modoLocal, true)
  assert.equal(r.supabaseConfigurado, false)
})

test('flag com valor que não é 1 é ignorada', () => {
  const r = resolverModo({ url: 'https://x.supabase.co', anonKey: 'k', flagLocal: '0' })
  assert.equal(r.modoLocal, false)
  assert.equal(r.supabaseConfigurado, true)
})

test('chave só com url, sem anon key: conta como não configurado', () => {
  const r = resolverModo({ url: 'https://x.supabase.co', anonKey: '', flagLocal: undefined })
  assert.equal(r.modoLocal, true)
  assert.equal(r.supabaseConfigurado, false)
})

test('strings vazias de env não contam como chaves', () => {
  const r = resolverModo({ url: '', anonKey: '', flagLocal: undefined })
  assert.equal(r.modoLocal, true)
})
