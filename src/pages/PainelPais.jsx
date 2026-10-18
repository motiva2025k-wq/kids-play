// Painel do aluno — itens equipados e título escolhido.
// Mantém o layout do jogo original; só adiciona o acesso rápido à loja.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { lerPerfilSelecionado } from '../lib/perfil.js'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import { dizer } from '../components/kapivarus/falas.mjs'
import { IconeBau, IconeAvatar, IconeCoroa, IconeChama, IconeMoeda, IconePergaminho } from '../components/ui/Icones.jsx'
import { useKidsPlay } from '../store/estado.js'
import { useKidsPlayReact } from '../store/useKidsPlay.js'

const SLOTS = [
  { slot: 'avatar', icone: IconeAvatar },
  { slot: 'moldura_fundo', icone: IconePergaminho },
  { slot: 'balao', icone: IconeBau },
  { slot: 'cenario', icone: IconePergaminho },
  { slot: 'titulo', icone: IconeCoroa },
]

const CARDS = [
  { rotulo: 'Moedas', icone: IconeMoeda, cor: 'verde', valor: 0 },
  { rotulo: 'Nível', icone: IconeCoroa, cor: 'roxo', valor: 1 },
  { rotulo: 'Dias seguidos', icone: IconeChama, cor: 'laranja', valor: 0 },
]

export default function Painel() {
  const navigate = useNavigate()
  const profile = lerPerfilSelecionado()
  const { purchase, state, subscribe } = useKidsPlayReact()
  const { moedas } = state
  const [evento, setEvento] = useState(0)


  useEffect(() => {
    setEvento((e) => e + 1)
  }, [profile])

  const itens = useMemo(() => {
    const inventario = profile?.inventario ?? profile?.itens_coletados ?? []
    const map = new Map()
    for (const item of inventario) {
      if (item?.id) map.set(item.id, item.quantidade ?? (item.equipado ? 1 : 0))
    }
    return map
  }, [profile])

  const equipados = useMemo(() => {
    if (!profile) return {}
    if (profile.equipados && typeof profile.equipados === 'object') return profile.equipados
    return {
      avatar: profile.avatar_id,
      moldura_fundo: profile.moldura_id,
      balao: profile.balao_id,
      cenario: profile.cenario_id,
      titulo: profile.titulo_id,
    }
  }, [profile])

  const titulo = profile?.titulo_nome || profile?.titulo || ''

  const ctx = {
    nome: profile?.nickname || profile?.nome || '...',
    moedas,
    xp: profile?.xp ?? 0,
    nivel: profile?.nivel ?? 1,
    dias: profile?.diasSeguidos ?? 0,
  }

  const fala = dizer('perfil_aberto', ctx)

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-afunda bloco px-4 py-2 text-base font-bold">
              ← Voltar
            </button>
            <h1 className="text-2xl font-bold">Perfil</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-3xl bg-roxo-claro/40 px-4 py-2">
              <IconeMoeda size={22} />
              <span className="text-lg font-bold text-roxo-escuro">{moedas}</span>
            </div>
            <button type="button" onClick={() => navigate('/home')} className="btn-afunda bloco px-4 py-2 text-base font-bold">
              Início
            </button>
            <div className="w-20" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bloco flex h-24 w-24 items-center justify-center rounded-3xl bg-roxo-claro">
            <IconeAvatar size={64} />
          </div>
          <div className="flex flex-col justify-between gap-2">
            <p className="text-xl font-bold">{ctx.nome}</p>
            <p className="text-sm opacity-70">{titulo ? `Título: ${titulo}` : 'Sem título definido.'}</p>
            <div className="flex flex-wrap gap-2">
              {SLOTS.map(({ slot, icone: Icone }) => {
                const id = equipados[slot]
                const nome = id ? Object.keys(itens).find((k) => itens[k] === id) : null
                return (
                  <span key={slot} className="flex items-center gap-1 rounded-2xl bg-white px-3 py-1 text-xs font-bold text-roxo-escuro">
                    <Icone size={16} />
                    {nome || 'vazio'}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          {CARDS.map(({ rotulo, icone: Icone, cor, valor }) => (
            <div key={rotulo} className="bloco flex flex-col items-center gap-1 rounded-3xl px-4 py-3">
              <Icone size={26} />
              <span className="text-sm font-bold">{rotulo}</span>
              <span className="text-xl font-bold">{valor}</span>
            </div>
          ))}
        </section>

        <div className="flex justify-center">
          <KapivarusFala
            texto={fala.texto}
            tom="dica"
            efeito={fala.efeito}
            aguardandoInteracao
            rodape={
              <button
                type="button"
                onClick={() => navigate('/loja')}
                aria-label="Abrir loja"
                className="btn-afunda bloco inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 bg-white px-3 py-2 text-sm font-bold text-roxo-escuro hover:bg-roxo-claro"
              >
                <IconeBau size={18} />
                Ir para a loja
              </button>
            }
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/loja')}
            aria-label="Abrir loja"
            className="btn-afunda bloco w-full max-w-xs rounded-3xl bg-white px-6 py-4 text-lg font-bold text-roxo-escuro shadow-[0_6px_0_0_var(--color-roxo-claro)] transition-colors hover:bg-roxo-claro hover:text-white"
          >
            <span className="inline-flex items-center justify-center gap-3">
              <IconeBau size={22} />
              <span>Ir para a Loja</span>
              <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 6L8.5 4.5 4.5 9l1.5 1.5L10 11l5 1.5-1.5 1.5z" fill="#7a5600" stroke="none" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </Layout>
  )
}
