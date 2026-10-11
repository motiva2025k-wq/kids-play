// Guarda na memória do aparelho qual criança está jogando.
// (É só conveniência visual: o banco sempre confirma o dono com o login.)
const CHAVE = 'kids_play_perfil'

export function guardarPerfilSelecionado(perfil) {
  localStorage.setItem(CHAVE, JSON.stringify(perfil))
}

export function lerPerfilSelecionado() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE))
  } catch {
    return null
  }
}

export function limparPerfilSelecionado() {
  localStorage.removeItem(CHAVE)
}
