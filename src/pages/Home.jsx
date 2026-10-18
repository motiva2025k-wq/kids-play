// Home — trilha de missões com tema de jogo.
// HUD com ícones, botões grandes estilo jogo; textos e lógica inalterados.
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Kapivarus from "../components/kapivarus/Kapivarus.jsx"
import { dizer, dizerAoAcordar, podeTocar, podeFalarOcioso, registrarOcioso, resetarToques, resetarOciosos, regras, segundosOciosos } from "../components/kapivarus/falas.mjs"
import Button from "../components/ui/Button.jsx"
import Layout from "../components/Layout.jsx"
import HudItem from "../components/ui/HudItem.jsx"
import { IconeChama, IconeCoroa, IconeMoeda, IconePergaminho, IconeEstrela } from "../components/ui/Icones.jsx"
import { lerPerfilSelecionado } from "../lib/perfil.js"
import { carregarProgresso, atualizarDia, registrarDiaJogado } from "../lib/progresso.js"

// Última visita (para decidir "volta_apos_dias") e lembrete de sessão.
const CHAVE_ULTIMA_VISITA = "kp_ultima_visita_iso"
const DIAS_PARA_VOLTA = 3

function diasDesde(ultimaVisitaIso) {
  if (!ultimaVisitaIso) return null
  const anterior = new Date(ultimaVisitaIso)
  if (Number.isNaN(anterior.getTime())) return null
  const ms = Date.now() - anterior.getTime()
  return Math.floor(ms / 86400000)
}

export default function Home() {
  const navegar = useNavigate()
  // Lê o perfil UMA vez (memoizado): JSON.parse a cada render criava uma
  // referência nova por render → contexto novo → loop de renderização.
  const perfil = useMemo(() => lerPerfilSelecionado(), [])
  const missoes = [
    { id: 1, nome: "Aldeia", feito: true },
    { id: 2, nome: "Floresta", feito: false },
    { id: 3, nome: "Montanha", feito: false },
  ]

  // Progresso real (localStorage) — vira o contexto das falas do catálogo.
  const [prog, setProg] = useState(() => carregarProgresso())

  // Dados do aluno para as variáveis do catálogo ({nome}, {xp}, …).
  const contexto = useMemo(
    () => ({
      nome: perfil?.nickname || perfil?.nome || "",
      xp: prog.xp,
      nivel: prog.nivel,
      dias: prog.diasSeguidos,
      moedas: prog.moedas,
      missoes: perfil?.missoes_concluidas ?? perfil?.missoes ?? 0,
    }),
    [perfil, prog],
  )

  // Fala do Kapivarus (catálogo). "acordada" = dormindo até o 1º toque.
  // Fonte única do balão: dizer()/dizerAoAcordar() já devolvem { texto, estado, efeito }.
  const [fala, setFala] = useState({ texto: "", estado: "neutro", efeito: "suave" })
  const [acordado, setAcordado] = useState(true)

  useEffect(() => {
    resetarToques()
    resetarOciosos()
    atualizarDia()

    const ultima = localStorage.getItem(CHAVE_ULTIMA_VISITA)
    const dias = diasDesde(ultima)

    // registra o jogo de hoje e vê se bateu um novo marco de dias seguidos
    const { diasSeguidos, novoMarco } = registrarDiaJogado()
    const progAtual = carregarProgresso()
    setProg(progAtual)

    // Monta o contexto AQUI (a partir do progresso já atualizado), para o
    // efeito não depender do memo `contexto` e rodar só na montagem.
    const ctx = {
      nome: perfil?.nickname || perfil?.nome || "",
      xp: progAtual.xp,
      nivel: progAtual.nivel,
      dias: progAtual.diasSeguidos,
      moedas: progAtual.moedas,
      missoes: perfil?.missoes_concluidas ?? perfil?.missoes ?? 0,
    }

    if (dias != null && dias >= DIAS_PARA_VOLTA) {
      // ficou dias sem entrar → volta_apos_dias (dormindo até tocar)
      setAcordado(false)
      setFala(dizer("volta_apos_dias", ctx))
    } else if (novoMarco) {
      // novo marco de dias seguidos (3, 7, 14…)
      setAcordado(true)
      setFala(dizer("dias_seguidos", { ...ctx, dias: diasSeguidos }))
    } else {
      setAcordado(true)
      setFala(dizer("boas_vindas", ctx))
    }

    // registra a visita de agora
    localStorage.setItem(CHAVE_ULTIMA_VISITA, new Date().toISOString())
    // Roda só na montagem: `perfil` é estável (memoizado com []).
  }, [perfil])

  // Ocioso: um lembrete gentil por tela, nunca durante atividade (aqui, nunca).
  useEffect(() => {
    const espera = (regras().ocioso_segundos ?? segundosOciosos()) * 1000
    let timer
    function agendar() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (podeFalarOcioso({ atividadeEmAndamento: false })) {
          registrarOcioso()
          setFala(dizer("ocioso", contexto))
        }
      }, espera)
    }
    agendar()
    const aoMover = () => agendar()
    window.addEventListener("pointerdown", aoMover)
    window.addEventListener("keydown", aoMover)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("pointerdown", aoMover)
      window.removeEventListener("keydown", aoMover)
    }
  }, [contexto])

  // Despedida ao sair/fechar a aba (best-effort).
  useEffect(() => {
    function aoSair() {
      setFala(dizer("despedida", contexto))
    }
    window.addEventListener("beforeunload", aoSair)
    return () => window.removeEventListener("beforeunload", aoSair)
  }, [contexto])

  // Toque no Kapivarus: respeita intervalo mínimo; se dormindo, acorda.
  function aoTocarKapivarus() {
    if (!podeTocar()) return
    if (!acordado) {
      setAcordado(true)
      setFala(dizerAoAcordar(contexto))
      return
    }
    setFala(dizer("toque", contexto))
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        {/* Botão de entrada na loja — ícone de baú, sem mudar o layout do jogo */}
        <div className="flex justify-center">
          <Button variante="fantasma" onClick={() => navegar("/loja")} aria-label="Abrir loja">
            <span className="inline-flex items-center gap-2">
              <svg width={26} height={26} viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="9" width="18" height="11" rx="1.5" fill="#f5b301" stroke="#7a5600" strokeWidth="2" />
                <path d="M3 9a9 6 0 0 1 18 0z" fill="#c99a66" stroke="#7a5600" strokeWidth="2" />
                <rect x="3" y="12" width="18" height="2.6" fill="#f5b301" stroke="#7a5600" strokeWidth="1.4" />
                <rect x="10.4" y="12.4" width="3.2" height="4.2" rx="1" fill="#f5b301" stroke="#7a5600" strokeWidth="1.2" />
              </svg>
              <span>Loja</span>
            </span>
          </Button>
        </div>

        {/* HUD do jogador — mesmos valores do Badges (XP 150, Moedas 25, Nível 3, Streak 7) */}
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          <HudItem icone={<IconeEstrela size={26} />} animar="estrela-pulsar" cor="dourado" rotulo="XP" valor={prog.xp} />
          <HudItem icone={<IconeMoeda size={26} />} animar="moeda-girar" cor="verde" rotulo="Moedas" valor={prog.moedas} />
          <HudItem icone={<IconeCoroa size={26} />} cor="roxo" rotulo="Nível" valor={prog.nivel} />
          <HudItem icone={<IconeChama size={26} />} animar="chama-balancar" cor="laranja" rotulo="Dias seguidos" valor={prog.diasSeguidos} />
        </div>

        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          {/* Exemplo do componente reutilizável: estado + balão de fala + tamanho "m" */}
          <div onClick={aoTocarKapivarus} className="inline-block cursor-pointer" role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") aoTocarKapivarus() }}
            aria-label="Falar com o Kapivarus">
            <Kapivarus
              estado={fala.estado}
              mensagem={fala.texto}
              efeito={fala.efeito}
              tom={fala.efeito === "confete" || fala.efeito === "estrelinhas" ? "acerto" : fala.efeito === "pulsar" ? "incentivo" : "dica"}
              tamanho="m"
            />
          </div>
          <div className="bloco max-w-xl px-6 py-4">
            <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
            <p className="mt-1 text-lg">Um objetivo por tela. Sem pressa, sempre juntos!</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bloco flex h-12 w-12 items-center justify-center bg-dourado-claro">
                <IconePergaminho size={26} />
              </div>
              <button
                type="button"
                onClick={() => navegar("/reforco")}
                className="btn-jogo btn-afunda bloco flex-1 px-4 py-3 text-left text-lg font-bold hover:bg-roxo-claro"
              >
                Treino do Kapivarus
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <IconePergaminho size={24} />
            Trilha de missões
          </h2>
          <div className="space-y-3">
            {missoes.map((m, idx) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className={`bloco flex h-12 w-12 items-center justify-center text-xl font-bold ${m.feito ? "bg-verde-claro" : "bg-white"}`}>
                  {m.feito ? "✓" : idx + 1}
                </div>
                <button
                  type="button"
                  onClick={() => navegar("/missao")}
                  className="btn-jogo btn-afunda bloco flex-1 px-4 py-3 text-left text-lg font-bold hover:bg-roxo-claro"
                >
                  Missão {m.id} — {m.nome}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
