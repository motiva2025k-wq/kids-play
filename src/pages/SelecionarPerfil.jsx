import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { avatarPorId } from '../data/avatares.js'
import { guardarPerfilSelecionado } from '../lib/perfil.js'
import { supabase } from '../lib/supabase.js'

export default function SelecionarPerfil() {
  const { usuario, sair } = useAuth()
  const navegar = useNavigate()

  const [criancas, setCriancas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    supabase
      .from('children')
      .select('id, nickname, school_year, avatar_id, xp, coins, stage')
      .order('created_at')
      .then(({ data, error }) => {
        if (!ativo) return
        if (error) {
          setErro('Não deu para carregar os perfis. Recarregue a página.')
          console.error(error)
        } else {
          setCriancas(data ?? [])
        }
        setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  function escolher(crianca) {
    guardarPerfilSelecionado(crianca)
    navegar('/painel')
  }

  // Conta nova sem filhos: manda direto para a criação do primeiro perfil.
  if (!carregando && !erro && criancas.length === 0) {
    return <Navigate to="/criar-perfil" replace />
  }

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quem vai estudar hoje?</h1>
          <p className="opacity-80">Toque no seu perfil para começar.</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await sair()
            navegar('/login')
          }}
          className="font-bold text-roxo underline"
        >
          Sair
        </button>
      </div>

      {carregando ? (
        <p className="text-lg">Carregando perfis…</p>
      ) : erro ? (
        <p role="alert" className="rounded-2xl bg-roxo-claro p-3 font-semibold text-alerta">
          {erro}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {criancas.map((crianca) => {
            const avatar = avatarPorId(crianca.avatar_id)
            return (
              <button
                key={crianca.id}
                type="button"
                onClick={() => escolher(crianca)}
                className="flex items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-[0_6px_0_0_var(--color-roxo-claro)] hover:bg-roxo-claro"
              >
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{ backgroundColor: avatar.cor }}
                >
                  {crianca.nickname[0].toUpperCase()}
                </span>
                <span>
                  <span className="block text-xl font-bold">{crianca.nickname}</span>
                  <span className="block opacity-70">{crianca.school_year}º ano</span>
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => navegar('/criar-perfil')}
            className="flex min-h-28 items-center justify-center rounded-3xl border-4 border-dashed border-roxo-claro bg-white/60 text-lg font-bold text-roxo hover:bg-white"
          >
            + Criar perfil de outra criança
          </button>
        </div>
      )}

      <footer className="mt-10 text-sm opacity-70">
        Conta de: <strong>{usuario?.email}</strong>
      </footer>
    </Layout>
  )
}
