// MapaDeMissoes — tela com o mapa de missões (FASE 3).
//
// Fluxo/estados:
//   - Seletor de matéria no topo (ícones grandes) com anos do perfil (2º, 3º ou 4º)
//   - Cada missão aparece como bloco com estado:
//       bloqueada  -> cinza, com cadeado (não está disponível)
//       disponível -> branca, botão acionável
//       concluída  -> verde com estrelas (desbloqueia a próxima)
//     O desbloqueio sequencial é: a próxima só aparece disponível quando a
//     anterior foi concluída por essa criança.
//
// Componentes envolvidos:
//   - Kapivarus (boas-vindas)
//   - ProgressBar / Badge (resumo)
//   - Card, Button (seletor e blocos)
//   - Renderer de exercícios não entra aqui (só na tela de prova)
//
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { lerPerfilSelecionado } from '../lib/perfil.js'
import Kapivarus from '../components/kapivarus/Kapivarus.jsx'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Card from '../components/ui/Card.jsx'
import Layout from '../components/Layout.jsx'
import { repo } from '../lib/repo/index.js'
import { modoLocal } from '../lib/modo.js'
import { dizer } from '../components/kapivarus/falas.mjs'

// icones nominais para matérias (sem imagem externa; usa emojis só como placeholder,
// será substituído por SVG nas próximas iterações se necessário)
const ICONES = {
  portugues: '🔤',
  matematica: '🔢',
  ciencias: '🔬',
  historia: '📜',
  geografia: '🌍',
}

const MATERIAS = [
  { id: 'portugues', nome: 'Português', icone: ICONES.portugues },
  { id: 'matematica', nome: 'Matemática', icone: ICONES.matematica },
  { id: 'ciencias', nome: 'Ciências', iconne: ICONES.ciencias },
  { id: 'historia', nome: 'História', icone: ICONES.historia },
  { id: 'geografia', nome: 'Geografia', icone: ICONES.geografia },
]

// cores nominais por matéria (pode vir do DB em breve)
const CORES = {
  portugues: '#4c1d95',    // roxo-escuro
  matematica: '#7a5600',   // dourado-escuro
  ciencias: '#0369a1',     // céu-escuro
  historia: '#7f1d1d',     // vermelho-escuro-suave
  geografia: '#2e7d32',    // verde-escuro
}

const NIVEL_ESTRELA = { 1: '☆', 2: '★', 3: '★★' }

export default function MapaDeMissoes() {
  const navegar = useNavigate()
  const auth = useAuth()
  const perfil = lerPerfilSelecionado()
  const idCrianca = perfil?.id

  const ano = perfil?.school_year || '2'
  const contexto = useMemo(() => ({ nome: perfil?.nickname || perfil?.nome || '' }), [perfil])
  const falaBoasVindas = useMemo(() => dizer('boas_vindas', contexto), [contexto])

  // O conteúdo embarcado no modo local é só de Matemática; nas outras
  // matérias não há nada para mostrar, então a tela já abre na certa.
  const [materiaId, setMateriaId] = useState(modoLocal ? 'matematica' : 'portugues')
  const [missoes, setMissoes] = useState([])
  const [concluidas, setConcluidas] = useState([])
  const [carregando, setCarregando] = useState(true)

  // carrega missões da matéria selecionada + quais já foram concluídas
  const recarregarMapa = useCallback(async () => {
    if (!idCrianca) {
      setCarregando(false)
      return
    }
    setCarregando(true)
    const [missoesCarregadas, concluidasCarregadas] = await Promise.all([
      repo.carregarMissoes(ano, materiaId),
      repo.missoesConcluidas(idCrianca),
    ])
    setMissoes(missoesCarregadas)
    setConcluidas(concluidasCarregadas)
    setCarregando(false)
  }, [idCrianca, ano, materiaId])

  useEffect(() => {
    recarregarMapa()
  }, [recarregarMapa])

  const materiasVisiveis = modoLocal
    ? MATERIAS.filter((m) => m.id === 'matematica')
    : MATERIAS
  const materia = materiasVisiveis.find((m) => m.id === materiaId) || materiasVisiveis[0]

  // estados dos blocos
  function estadoDaMissao(idx, missao, todas) {
    const id = missao.id
    if (!concluidas.includes(id)) {
      // disponível só se é a primeira da trilha ou a anterior foi concluída
      const anterior = idx > 0 ? todas[idx - 1]?.id : null
      if (anterior && !concluidas.includes(anterior)) return 'bloqueada'
      return 'disponivel'
    }
    return 'concluida'
  }

  const cores = CORES[materiaId] || '#4c1d95'

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navegar('/home')}>
          ← Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Kapivarus pose="feliz" size={48} />
          <span className="text-xl font-bold">Missões</span>
        </div>
        <div className="w-[90px]" />
      </div>

      {/* boas-vindas */}
      <div className="mb-4 flex justify-center">
        <KapivarusFala
          pose={falaBoasVindas.estado}
          tom="dica"
          efeito={falaBoasVindas.efeito}
          texto={falaBoasVindas.texto}
        />
      </div>

      {/* seletor de matéria (ícones grandes) */}
      <Card className="mb-6">
        <h3 className="mb-4 text-lg font-bold">Escolha a matéria</h3>
        <div className="grid grid-cols-5 gap-3">
          {materiasVisiveis.map((m) => {
            const ativo = m.id === materiaId
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMateriaId(m.id)
                  setConcluidas([])
                }}
                className={`btn-afunda bloco flex flex-col items-center gap-2 p-3 text-center ${ativo ? 'ring-4 ring-dourado' : ''}`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {m.icone}
                </span>
                <span className="text-sm font-bold">{m.nome}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* trilha de missões */}
      {carregando ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-roxo-claro animate-pulse" />
          ))}
        </div>
      ) : missoes.length === 0 ? (
        <div className="bloco p-6 text-center">
          {modoLocal ? (
            <>
              <p className="text-lg font-bold">
                Este ano ainda não tem missões offline 😴
              </p>
              <p className="mt-1 opacity-80">
                As missões sem internet estão disponíveis para o 3º ano.
                Escolha outro perfil ou conecte o app ao Supabase para ver
                todas.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold">Nenhuma missão disponível por enquanto.</p>
              <p className="mt-1 opacity-80">Volte mais tarde ou escolha outra matéria.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Trilha — {materia.nome}</h2>
            <Badge tipo="nivel" valor={Number(ano)} />
          </div>

          <div className="space-y-3">
            {missoes.map((m, idx) => {
              const estado = estadoDaMissao(idx, m, missoes)
              const concluida = concluidas.includes(m.id)

              // número de estrelas: se não há dado, mostra 1 por padrão (view em breve)
              // pois a view de desempenho_tem um placeholder até a Fase 6
              const nEstrelas = 1

              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={estado === 'bloqueada'}
                  onClick={() => {
                    if (estado === 'disponivel') {
                      navegar(`/missao/${m.id}`)
                    }
                  }}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-colors ${
                    estado === 'bloqueada'
                      ? 'border-neutro-200 bg-neutro-100 opacity-70 cursor-not-allowed'
                      : estado === 'disponivel'
                      ? 'border-roxo bg-roxo-claro hover:bg-roxo/20'
                      : 'border-verde-escuro bg-verde-claro'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* status bloco */}
                    <div
                      className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold ${
                        estado === 'bloqueada'
                          ? 'bg-neutro-200 text-neutro-700'
                          : estado === 'disponivel'
                          ? 'bg-roxo text-white'
                          : 'bg-verde text-white'
                      }`}
                    >
                      {estado === 'bloqueada' ? (
                        <span aria-hidden="true">🔒</span>
                      ) : estado === 'disponivel' ? (
                        <span aria-hidden="true">▶</span>
                      ) : (
                        <span aria-hidden="true">✔</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{m.titulo}</span>
                        {estado === 'concluida' && (
                          <div className="flex gap-0" aria-label={`${nEstrelas} estrelas`}>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <span key={i}>{i < nEstrelas ? '★' : '☆'}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-sm opacity-80">{m.descricao}</p>
                      <div className="mt-2 flex gap-2 text-xs font-semibold uppercase opacity-70">
                        <span className="rounded-full bg-roxo text-white px-2 py-0.5">
                          {m.dificuldade === 3 ? '⭐⭐⭐' : m.dificuldade === 2 ? '⭐⭐' : '⭐'}
                        </span>
                        {concluida && (
                          <span className="rounded-full bg-verde-claro px-2 py-0.5 text-verde-escuro">
                            Concluída
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* rodapé de ajuda */}
      <div className="mt-8 text-center text-sm opacity-70">
        Para desbloquear a próxima missão, precisei completing a anterior.
      </div>
    </Layout>
  )
}
