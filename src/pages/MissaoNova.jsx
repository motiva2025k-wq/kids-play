// MissaoNova — tela do motor de missão (FASE 3).
//
// Fluxo:
// 1. Kapivarus dá boas-vindas + objetivo (frase da missão)
// 2. UMA pergunta por vez, com ProgressBar 3 de 6 (exemplo)
// 3. Ao responder: acerto -> comemora + XP; erro -> incentivo + dica (2 novas tentativas, sem perda de pontos)
// 4. Botão de pausa sempre visível
// 5. Ao final: tela de resultado com estrelas, XP, moedas, resumo + mensagem do Kapivarus
//
// Só depende do contexto Auth e do hook useMissao.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Kapivarus from '../components/kapivarus/Kapivarus.jsx'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import Button from '../components/ui/Button.jsx' // Button primário
import Botao from '../components/ui/Botao.jsx' // Botao variante
import ProgressBar from '../components/ui/ProgressBar.jsx'
// o Renderer de exercícios
import RendererExercicios from '../components/exercicios/RendererExercicios.jsx'
import Card from '../components/ui/Card.jsx'
import Layout from '../components/Layout.jsx'
import { useMissao } from '../lib/useMissao.js'
import { fraseComEmbrace, FRASES_BOAVINDAS, FRASES_FINAL_ACERTO, FRASES_FINAL_INCENTIVO } from "../data/frasesDeMissao.js";
import { lerPerfilSelecionado } from '../lib/perfil.js'
import { dizer, estadoDe } from '../components/kapivarus/falas.mjs'
import { supabase } from '../lib/supabase.js'
import { aplicarResultadoMissao } from '../lib/progresso.js'
import { repo } from '../lib/repo/index.js'

// ---------- Web Speech (ATRIBUTO: modo reforço) ----------
const sintetizador = typeof window !== 'undefined' ? window.speechSynthesis : null

function falarTexto(texto, velocidade = 0.92) {
  if (!sintetizador) return
  // finaliza qualquer fala em curso antes de começar uma nova
  if (sintetizador.speaking) sintetizador.cancel()
  const u = new SpeechSynthesisUtterance(texto)
  u.lang = 'pt-BR'
  u.rate = velocidade
  u.pitch = 1
  u.volume = 1
  sintetizador.speak(u)
}

export default function MissaoNova() {
  const { id } = useParams()            // :id da missão na rota
  const navegar = useNavigate()
  const auth = useAuth()
  const perfil = lerPerfilSelecionado()

  // O id vai como está: `Number(id)` transformava ids de texto
  // ('mat3-mult-m1') em 0 e a missão nunca carregava.
  const idMissao = id || null
  const idCrianca = perfil?.id

  // ref para o bark.evento achar a falarEvento mais recente (definida abaixo)
  const falarEventoRef = useRef(null)

  const {
    status,
    pergunta,
    posicao,
    total,
    resultado,
    enunciadoLido,
    carregar,
    responder,
    usarDica,
    pausar,
    retomar,
    recarregar,
    confirmarEnvio,
    setPergunta,
  } = useMissao({
    idCrianca,
    idMissao,
    bark: {
      falar: (texto, tom, pose) => {
        falarTexto(texto)
      },
      // o motor dispara o evento do catálogo a cada passo;
      // aqui só traduzimos o evento em fala do Kapivarus.
      evento: (ev) => {
        falarEventoRef.current?.(ev)
      },
    },
  })

  const [pausado, setPausado] = useState(false)
  const [avisoEnvio, setAvisoEnvio] = useState(null)
  const [lastPerguntaId, setLastPerguntaId] = useState(null)
  const [reportText, setReportText] = useState('')
  const [reportando, setReportando] = useState(false)

  // ------- falas do catálogo (Kapivarus) -------
  const contexto = useMemo(
    () => ({
      nome: perfil?.nickname || perfil?.nome || '',
      xp: resultado?.xp ?? 0,
      nivel: perfil?.nivel ?? perfil?.level ?? 1,
      moedas: resultado?.moedas ?? 0,
      missoes: perfil?.missoes_concluidas ?? perfil?.missoes ?? 0,
    }),
    [perfil, resultado],
  )
  // se a missão é de leitura (matéria de Português/Língua) → leitura_inicio
  const [missaoLeitura, setMissaoLeitura] = useState(false)
  const [falaProva, setFalaProva] = useState(() => dizer('inicio_missao', contexto))

  // detecta se a missão é de leitura (para usar leitura_inicio no 1º enunciado)
  useEffect(() => {
    let vivo = true
    async function checar() {
      const detalhe = await repo.carregarMissaoComPerguntas(idMissao)
      if (!vivo) return
      const nome = (detalhe?.materias?.nome || '').toLowerCase()
      setMissaoLeitura(nome.includes('portug') || nome.includes('l.ngua'))
    }
    if (idMissao) checar()
    return () => {
      vivo = false
    }
  }, [idMissao])

  // ------- fala por evento -------
  const falarEvento = useCallback(
    (evento) => {
      const f = dizer(evento, contexto)
      setFalaProva(f)
      return f
    },
    [contexto],
  )
  // sempre aponta para a versão mais recente (contexto muda a cada resultado)
  falarEventoRef.current = falarEvento

  // garantir carregamento da missao ao montar e se o id mudar
  useEffect(() => {
    carregar()
  }, [idMissao, carregar])

  useEffect(() => {
    if (pergunta?.id) setLastPerguntaId(pergunta.id)
  }, [pergunta])

  // ao responder: o motor do hook já calcula acerto/erro/sequência e dispara
  // o evento via bark.evento; aqui só encaminhamos a resposta e o envio.
  const handleResponder = useCallback(
    (escolhaCorreta) => {
      responder(escolhaCorreta === true)
      confirmarEnvio()
    },
    [responder, confirmarEnvio],
  )

  // ---------- pausa ----------
  const handlePausar = useCallback(() => {
    setPausado(true)
    pausar()
  }, [pausar])

  const handleRetomar = useCallback(() => {
    setPausado(false)
    retomar()
  }, [retomar])

  // ---------- áudio de enunciado ----------
  const handleLerEmVozAlta = useCallback(() => {
    if (pergunta?.enunciado) falarTexto(pergunta.enunciado)
  }, [pergunta])

  const handleReportarErro = useCallback(async () => {
    if (!lastPerguntaId || !reportText.trim() || !supabase) return
    setReportando(true)
    try {
      await supabase.from('relatos_erro').insert({
        pergunta_id: lastPerguntaId,
        texto: reportText.trim()
      })
      setReportText('')
      alert('Obrigado pelo feedback!')
    } catch (e) {
      console.error(e)
    } finally {
      setReportando(false)
    }
  }, [lastPerguntaId, reportText])

  // fala de conclusão (com erros → missao_concluida_sem_acertar_tudo)
  // + detecta "subiu de nível" e "meta do dia" pelo progresso local
  const missaoJaProcessada = useRef(false)
  useEffect(() => {
    if (status !== 'final' || !resultado || missaoJaProcessada.current) return
    missaoJaProcessada.current = true

    const perfeito = resultado.acertos === resultado.total
    const eventoBase = perfeito ? 'missao_concluida' : 'missao_concluida_sem_acertar_tudo'

    const { subiuDeNivel, metaDoDia } = aplicarResultadoMissao({ estrelas: resultado.estrelas })

    // prioridade: subir de nível > meta do dia > conclusão da missão
    if (subiuDeNivel) {
      falarEvento('subiu_de_nivel')
    } else if (metaDoDia) {
      falarEvento('meta_do_dia')
    } else {
      falarEvento(eventoBase)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, resultado])

  // ---------- resultado final ----------
  const missaoCompleta = status === 'final'

  if (!perfil) {
    return (
      <Layout>
        <Card className="mx-auto mt-10 max-w-md p-8 text-center">
          <p className="text-lg font-bold">Selecione um perfil para jogar.</p>
          <Button className="mt-6" onClick={() => navegar('/perfis')}>Ir para perfis</Button>
        </Card>
      </Layout>
    )
  }

  if (status === 'carregando') {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <Kapivarus pose={estadoDe('carregando')} size={120} />
          <div className="txt">
            <h1 className="text-2xl font-bold">Carregando missão…</h1>
            <p className="opacity-80">Enquanto isso, respira fundo.</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (status === 'erro') {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <Kapivarus pose="pensando" size={120} />
          <div className="bloco max-w-md px-6 py-6 text-center">
            <h2 className="text-2xl font-bold">Ops, algo deu diferente</h2>
            <p className="opacity-80">Não consegui carregar a missão. Tenta de novo ou volta para o Painel.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navegar('/home')}>Voltar ao Painel</Button>
            <Button variant="secundario" onClick={() => recarregar()}>Tentar carregar de novo</Button>
          </div>
        </div>
      </Layout>
    )
  }

  // ---------- PAUSA ----------
  if (pausado && status !== 'final') {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <Kapivarus pose="neutro" size={120} />
          <div className="bloco max-w-md px-6 py-6 text-center">
            <h2 className="text-2xl font-bold">Pausado</h2>
            <p className="mt-2 opacity-80">
              Feche a tela se quiser. Ao voltar, continua exatamente aqui.
            </p>
          </div>
          <Button onClick={handleRetomar}>Continuar missão</Button>
          <Button variant="secundario" onClick={() => navegar('/painel')}>
            Voltar ao Painel
          </Button>
        </div>
      </Layout>
    )
  }

  // ---------- PROVA (pergunta por pergunta) ----------
  if (status === 'prova' && pergunta) {
    return (
      <Layout>
        {/* cabeçalho com progresso e pausa */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="secundario" onClick={() => navegar('/home')}>
            ← Sair
          </Button>
          <div className="flex-1 text-center">
            <ProgressBar
              valor={posicao / Math.max(total, 1)}
              rotulo={`Pergunta ${posicao} de ${total}`}
              className="w-full"
            />
          </div>
          <Button variant="secundario" onClick={handlePausar}>
            Pausar
          </Button>
        </div>

        {/* boas-vindas do Kapivarus na primeira (leitura usa leitura_inicio) */}
        {posicao === 1 && (
          <div className="mb-6">
            <KapivarusFala
              pose={missaoLeitura ? estadoDe('leitura_inicio') : falaProva.estado}
              tom="acerto"
              texto={fraseComEmbrace(pergunta.enunciado, pergunta.titulo || '')}
              mostrarBotaoEntendi
              onEntendi={() => {}}
            />
          </div>
        )}

        {/* exercício */}
        <Card className="mb-6">
          <RendererExercicios
            pergunta={pergunta}
            onResponder={handleResponder}
            disabled={!!resultado}
            lerEmVozAlta={handleLerEmVozAlta}
            labelAcentuacao="Ouvir enunciado"
          />
        </Card>

        {/* feedback do Kapivarus */}
        <div className="flex justify-center">
          <KapivarusFala
            pose={falaProva.estado}
            tom="dica"
            efeito={falaProva.efeito}
            texto={falaProva.texto}
          />
        </div>
      </Layout>
    )
  }

  // ---------- RESULTADO FINAL ----------
  if (missaoCompleta && resultado) {
    const estrela = '★'
    const vazia = '☆'
    const linhasEstrelas = Array.from({ length: 3 }).map((_, i) =>
      i < resultado.estrelas ? estrela : vazia,
    ).join(' ')

    return (
      <Layout>
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="secundario" onClick={() => navegar(-1)}>
            ← Voltar
          </Button>
          <div className="text-center">
            <div className="text-sm font-semibold opacity-60">Sua missão acabou!</div>
          </div>
          <div className="w-[90px]" />
        </div>

        {/* tela de resultado */}
        <div className="mb-6 flex flex-col items-center gap-6 text-center">
          {/* Kapivarus festivo */}
          <Kapivarus
            pose={resultado.estrelas >= 3 ? 'comemorando' : resultado.estrelas === 2 ? 'feliz' : 'incentivando'}
            size={140}
          />

          {/* estrelas */}
          <div className="flex gap-2 text-5xl" aria-label="Estrelas">
            {linhasEstrelas}
          </div>

          {/* números ganhos */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 w-full max-w-sm">
            <div className="bloco p-5 text-center">
              <div className="text-sm font-semibold opacity-70">XP ganhos</div>
              <div className="text-3xl font-bold text-roxo-escuro">+{resultado.xp}</div>
            </div>
            <div className="bloco p-5 text-center">
              <div className="text-sm font-semibold opacity-70">Moedas</div>
              <div className="text-3xl font-bold text-verde-escuro">+{resultado.moedas}</div>
            </div>
            <div className="bloco p-5 text-center">
              <div className="text-sm font-semibold opacity-70">Acertos</div>
              <div className="text-3xl font-bold text-dourado-escuro">
                {resultado.acertos} / {resultado.total}
              </div>
            </div>
          </div>

          {/* resumo*/}
          <div className="bloco max-w-md px-6 py-5 text-center">
            <p className="text-xl font-bold">
              Você fez {resultado.acertos} de {resultado.total}!
            </p>
            <p className="mt-2 text-lg opacity-80">
              {resultado.percentual}% de acertos — parabéns!
            </p>
            {resultado.refeita ? (
              <p className="mt-1 text-base opacity-80">Missão refeita — XP e bônus ao meio.</p>
            ) : null}
          </div>

          {/* frase do Kapivarus */}
          <div className="m-0 flex justify-center">
            <KapivarusFala
              pose={falaProva.estado}
              tom={resultado.estrelas >= 2 ? 'acerto' : 'incentivo'}
              efeito={falaProva.efeito}
              texto={falaProva.texto}
            />
          </div>
        </div>

        {/* próximos passos */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <Button onClick={() => navegar('/home')}>
            Voltar para a trilha
          </Button>
          <Button variant="secundario" onClick={() => recarregar()}>
            Tentar de novo (XP metade)
          </Button>
        </div>

        {/* Botão discreto para reportar erro */}
        <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
          <details className="w-full">
            <summary className="cursor-pointer text-sm opacity-70 text-center hover:opacity-100">
              Achei algo errado
            </summary>
            <div className="mt-2 p-3 bg-white rounded-xl border-2 border-roxo-claro">
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Descreva o problema encontrado..."
                className="w-full p-2 border rounded text-sm h-20"
                maxLength={500}
              />
              <Button
                className="mt-2 w-full"
                variant="secundario"
                onClick={handleReportarErro}
                disabled={reportando || !reportText.trim() || !lastPerguntaId}
              >
                {reportando ? 'Enviando...' : 'Enviar relato'}
              </Button>
            </div>
          </details>
        </div>
      </Layout>
    )
  }

  return null
}
