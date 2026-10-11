// Painel do jogador — tela inicial pós-login.
// Tema de jogo: HUD com ícones, chip da fase com cor de mundo, Kapivarus
// em destaque e botões grandes. Textos e lógica inalterados.
import { Navigate, useNavigate } from 'react-router-dom'
import Kapivarus from '../components/kapivarus/Kapivarus.jsx'
import Layout from '../components/Layout.jsx'
import BarraProgresso from '../components/ui/BarraProgresso.jsx'
import Botao from '../components/ui/Botao.jsx'
import Cartao from '../components/ui/Cartao.jsx'
import HudItem from '../components/ui/HudItem.jsx'
import { IconeChama, IconePergaminho, IconeMoeda, IconeEstrela } from '../components/ui/Icones.jsx'
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
  const stage = perfil.stage ?? 'aldeia'

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        {/* Avatar com moldura de jogo */}
        <span
          className="bloco flex h-20 w-20 shrink-0 items-center justify-center rounded-full p-1 text-3xl font-bold text-white"
          style={{ backgroundColor: avatar.cor }}
        >
          <span className="flex h-full w-full items-center justify-center rounded-full ring-4 ring-dourado">
            {perfil.nickname[0].toUpperCase()}
          </span>
        </span>
        <div>
          <h1 className="text-2xl font-bold">Oi, {perfil.nickname}!</h1>
          <p className="opacity-80">
            {perfil.school_year}º ano · Está na fase:{' '}
            <strong>{ESTAGIOS[perfil.stage] ?? 'Aldeia'}</strong>
          </p>
          {/* Chip colorido da fase/mundo (mesma fase do texto acima) */}
          <span className={`fase-chip fase-${stage} mt-1`}>
            🗺️ {ESTAGIOS[stage] ?? 'Aldeia'}
          </span>
        </div>
      </div>

      {/* Kapivarus em destaque, maior, com balão de fala (mesmo texto) */}
      <div className="mb-6">
        <Kapivarus
          estado="incentivando"
          tamanho={160}
          tom="incentivo"
          mensagem={`Ei, ${perfil.nickname}! Bem-vindo de volta. Em breve as missões curtas aparecem aqui — e eu vou te ajudar em cada passo!`}
        />
      </div>

      <Cartao className="mb-6">
        <BarraProgresso valor={0} rotulo="Meta do dia: 1 missão" />
      </Cartao>

      {/* HUD do jogador — medidores estilo jogo com ícones animados */}
      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <HudItem
          icone={<IconeEstrela size={30} />}
          animar="estrela-pulsar"
          cor="dourado"
          rotulo="XP"
          valor={perfil.xp ?? 0}
        />
        <HudItem
          icone={<IconeMoeda size={30} />}
          animar="moeda-girar"
          cor="verde"
          rotulo="Moedas"
          valor={perfil.coins ?? 0}
        />
        <HudItem
          icone={<IconeChama size={30} />}
          animar="chama-balancar"
          cor="laranja"
          rotulo="Dias seguidos"
          valor={perfil.streak_days ?? 0}
        />
      </div>

      <Cartao className="mb-6">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold">
          <IconePergaminho size={24} />
          O que vem agora
        </h2>
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
          👤 Trocar de perfil
        </Botao>
        <Botao variante="fantasma" onClick={() => navegar('/galeria')}>
          🎭 Ver o Kapivarus em todas as poses
        </Botao>
        <Botao
          variante="fantasma"
          onClick={async () => {
            limparPerfilSelecionado()
            await sair()
            navegar('/login')
          }}
        >
          🚪 Sair da conta ({usuario?.email})
        </Botao>
      </div>
    </Layout>
  )
}
