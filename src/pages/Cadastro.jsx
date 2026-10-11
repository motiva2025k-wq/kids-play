import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Botao from '../components/ui/Botao.jsx'
import Campo from '../components/ui/Campo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const navegar = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [pronto, setPronto] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha precisa de pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErro('As duas senhas não são iguais.')
      return
    }

    setSalvando(true)
    try {
      const entrouDireto = await cadastrar(email, senha)
      if (entrouDireto) {
        navegar('/criar-perfil')
      } else {
        // Confirmação de e-mail ligada no Supabase: precisa confirmar antes.
        setPronto(true)
      }
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (pronto) {
    return (
      <AuthLayout titulo="Quase lá!">
        <p className="text-lg">
          Conta criada com sucesso. Agora abra o e-mail do responsável e clique
          no link de confirmação do Supabase. Depois,{' '}
          <Link to="/login" className="font-bold text-roxo underline">
            entre com seu login
          </Link>
          .
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout titulo="Criar conta de responsável">
      <p className="mb-4 text-sm opacity-80">
        Só o responsável cria a conta. A criança não precisa de e-mail nem de
        senha — depois você cria o perfil dela.
      </p>

      <form onSubmit={aoEnviar} className="space-y-4">
        <Campo
          id="email"
          label="E-mail do responsável"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          id="senha"
          label="Senha (mínimo 6 caracteres)"
          type="password"
          autoComplete="new-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Campo
          id="confirmar"
          label="Repita a senha"
          type="password"
          autoComplete="new-password"
          required
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />

        {erro ? (
          <p role="alert" className="rounded-2xl bg-roxo-claro p-3 font-semibold text-alerta">
            {erro}
          </p>
        ) : null}

        <Botao type="submit" variante="verde" disabled={salvando}>
          {salvando ? 'Criando conta…' : 'Criar conta'}
        </Botao>
      </form>

      <p className="mt-4 text-center">
        Já tem conta?{' '}
        <Link to="/login" className="font-bold text-roxo underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
