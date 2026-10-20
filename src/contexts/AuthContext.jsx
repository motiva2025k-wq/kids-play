import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { supabaseConfigurado, modoLocal } from '../lib/modo'

const AuthContext = createContext(null)

// No modo local não há sessão, mas o app inteiro depende de um `usuario` para
// passar por RotaProtegida/RotaPublica. Devolvemos um usuário estável — e por
// isso nenhuma rota precisa mudar.
const USUARIO_LOCAL = { id: 'local', email: 'Modo local' }

// Traduz os erros do Supabase para uma linguagem simples.
function mensagemAmigavel(erro) {
  const texto = String(erro?.message ?? '')
  if (texto.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos. Tente de novo.'
  }
  if (texto.includes('already registered')) {
    return 'Este e-mail já tem conta. Faça login ou use outro e-mail.'
  }
  if (texto.toLowerCase().includes('email not confirmed')) {
    return 'Este e-mail ainda não foi confirmado. Abra a caixa de entrada e clique no link de confirmação.'
  }
  if (texto.includes('Password')) {
    return 'A senha precisa de pelo menos 6 caracteres.'
  }
  if (texto.includes('rate limit')) {
    return 'Muitas tentativas. Espere um minuto e tente de novo.'
  }
  return 'Não deu certo agora. Confira os dados e tente outra vez.'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Sem Supabase configurado, ou no modo local (onde supabase é null),
    // não há sessão a carregar: saímos do estado de carregamento na hora.
    if (!supabaseConfigurado || !supabase) {
      setCarregando(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setCarregando(false)
    })

    const { data: inscricao } = supabase.auth.onAuthStateChange(
      (_evento, novaSession) => {
        setSession(novaSession)
        setCarregando(false)
      },
    )

    return () => inscricao.subscription.unsubscribe()
  }, [])

  const valor = {
    session,
    usuario: modoLocal ? USUARIO_LOCAL : (session?.user ?? null),
    carregando,
    supabaseConfigurado,
    modoLocal,

    // Retorna true quando o login aconteceu na hora (confirmação de e-mail
    // desligada no Supabase); false quando é preciso confirmar o e-mail.
    async cadastrar(email, senha) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      })
      if (error) throw new Error(mensagemAmigavel(error))
      return Boolean(data.session)
    },

    async entrar(email, senha) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      })
      if (error) throw new Error(mensagemAmigavel(error))
    },

    async sair() {
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
