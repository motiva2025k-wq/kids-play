import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Botao from '../components/ui/Botao.jsx'
import Campo from '../components/ui/Campo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'

export default function Login() {
  const { entrar } = useAuth()
  const navegar = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await entrar(email, senha)
      navegar('/perfis')
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AuthLayout titulo="Entrar">
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
          label="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro ? (
          <p role="alert" className="rounded-2xl bg-roxo-claro p-3 font-semibold text-alerta">
            {erro}
          </p>
        ) : null}

        <Botao type="submit" disabled={salvando}>
          {salvando ? 'Entrando…' : 'Entrar'}
        </Botao>
      </form>

      <p className="mt-4 text-center">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-bold text-roxo underline">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  )
}
