import { Navigate, useNavigate } from 'react-router-dom'
import Kapivarus from '../components/kapivarus/Kapivarus.jsx'
import Layout from '../components/Layout.jsx'
import BalaoFala from '../components/ui/BalaoFala.jsx'
import BarraProgresso from '../components/ui/BarraProgresso.jsx'
import Botao from '../components/ui/Botao.jsx'
import Cartao from '../components/ui/Cartao.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { avatarPorId } from '../data/avatares.js'
import { lerPerfilSelecionado, limparPerfilSelecionado } from '../lib/perfil.js'

const ESTAGIOS = {
  aldeia: 'Aldeia',
  vila: 'Vila',
  castelo: 'Castelo',
  reino: 'Reino',
}

export default function Painel() {
  const { usuario, sair } = useAuth()
  const navegar = useNavigate()

  const perfil = lerPerfilSelecionado()

  // Ninguém escolheu perfil ainda? Volta para a lista.
  if (!perfil) return <Navigate to="/perfis" replace />

  const avatar = avatarPorId(perfil.avatar_id)

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <span
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white"
          style={{ backgroundColor: avatar.cor }}
        >
          {perfil.nickname[0].toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold">Oi, {perfil.nickname}!</h1>
          <p className="opacity-80">
            {perfil.school_year}º ano · Está na fase:{' '}
            <strong>{ESTAGIOS[perfil.stage] ?? 'Aldeia'}</strong>
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-end gap-2">
        <Kapivarus pose="incentivando" tamanho={130} />
        <BalaoFala>
          Ei, {perfil.nickname}! Bem-vindo de volta. Em breve as missões curtas
          aparecem aqui — e eu vou te ajudar em cada passo!
        </BalaoFala>
      </div>

      <Cartao className="mb-6">
        <BarraProgresso valor={0} rotulo="Meta do dia: 1 missão" />
      </Cartao>

      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <Cartao>
          <span className="block text-sm font-semibold opacity-70">XP</span>
          <span className="block text-2xl font-bold">{perfil.xp ?? 0}</span>
        </Cartao>
        <Cartao>
          <span className="block text-sm font-semibold opacity-70">Moedas</span>
          <span className="block text-2xl font-bold">{perfil.coins ?? 0}</span>
        </Cartao>
        <Cartao>
          <span className="block text-sm font-semibold opacity-70">Dias seguidos</span>
          <span className="block text-2xl font-bold">{perfil.streak_days ?? 0}</span>
        </Cartao>
      </div>

      <Cartao className="mb-6">
        <h2 className="mb-2 text-xl font-bold">O que vem agora</h2>
        <p>
          As <strong>missões curtas</strong> de Português, Matemática, Ciências,
          História e Geografia entram nas próximas fases do projeto. Por enquanto,
          a base de login e perfis já está pronta e segura.
        </p>
      </Cartao>

      <div className="space-y-3">
        <Botao
          variante="fantasma"
          onClick={() => {
            limparPerfilSelecionado()
            navegar('/perfis')
          }}
        >
          Trocar de perfil
        </Botao>
        <Botao variante="fantasma" onClick={() => navegar('/galeria')}>
          Ver o Kapivarus em todas as poses
        </Botao>
        <Botao
          variante="fantasma"
          onClick={async () => {
            limparPerfilSelecionado()
            await sair()
            navegar('/login')
          }}
        >
          Sair da conta ({usuario?.email})
        </Botao>
      </div>
    </Layout>
  )
}
