import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'

const AuthContext = createContext(null)

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
    if (!supabaseConfigurado) {
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
    usuario: session?.user ?? null,
    carregando,
    supabaseConfigurado,

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
