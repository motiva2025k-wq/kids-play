// Catálogo de avatares — personagens ORIGINAIS do Kids_Play.
// A arte animada chega na FASE 2; por ora cada avatar tem uma cor própria
// e uma letra inicial. Nenhuma referência a franquias existentes.

export const AVATARES = [
  { id: 'estrela', nome: 'Estrela', cor: '#f5b301' },
  { id: 'gotinha', nome: 'Gotinha', cor: '#38bdf8' },
  { id: 'foguinho', nome: 'Foguinho', cor: '#d64545' },
  { id: 'florzinha', nome: 'Florzinha', cor: '#4caf50' },
  { id: 'nuvem', nome: 'Nuvem', cor: '#8b7cf6' },
  { id: 'pedrinha', nome: 'Pedrinha', cor: '#7a5600' },
  { id: 'kapivara', nome: 'Kapivara', cor: '#b98a56' },
  { id: 'coelho', nome: 'Coelho', cor: '#cbd5e1' },
  { id: 'gato', nome: 'Gato', cor: '#f59e0b' },
  { id: 'cachorro', nome: 'Cachorro', cor: '#d97757' },
  { id: 'urso', nome: 'Urso', cor: '#92400e' },
  { id: 'raposa', nome: 'Raposa', cor: '#ea580c' },
]

export function avatarPorId(id) {
  return AVATARES.find((a) => a.id === id) ?? AVATARES[0]
}
