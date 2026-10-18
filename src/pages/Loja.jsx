// Loja — vitrine por categoria com prévia, confirmação de compra,
// celebração e falas do Kapivarus. Lê tudo do `kidsplay-catalogo-inicial.json`.
// Nenhum preço em dinheiro real, sem caixa-surpresa e sem perda de itens.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Cartao from '../components/ui/Cartao.jsx'
import Botao from '../components/ui/Botao.jsx'
import Confete from '../components/ui/Confete.jsx'
import { IconeBau, IconeMoeda, IconeCadeado, IconeDesejo, IconePergaminho } from '../components/ui/Icones.jsx'
import { useKidsPlay } from '../store/estado.js'
import { parsearCatalogo, estadoLoja, dicaRequisito, comprarItem, eItemValido, eItemUnico, eConsumivel } from '../store/loja.js'
import { categoriasLoja } from '../store/categorias.js'
import { validarCatalogo } from '../lib/validarCatalogo.js'
import { lerCatalogo } from '../lib/lojaCatalogo.js'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import { dizer } from '../components/kapivarus/falas.mjs'

function iconesTamanho(tamanho) {
  if (tamanho === 'grande') return 'text-4xl'
  if (tamanho === 'medio') return 'text-3xl'
  return 'text-2xl'
}

function seloEstado(catalogo, estado, item, id) {
  const condicao = estadoLoja(catalogo, estado, id)
  switch (condicao) {
    case 'disponivel':
      return null
    case 'bloqueado': {
      const dica = dicaRequisito(item)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-roxo-claro px-3 py-1 text-xs font-bold text-roxo-escuro">
          <IconeCadeado size={14} />
          {dica}
        </span>
      )
    }
    case 'possuido':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-verde-claro px-3 py-1 text-xs font-bold text-verde-escuro">
          ✓ Você tem
        </span>
      )
    case 'equipado':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-azul-claro px-3 py-1 text-xs font-bold text-azul-escuro">
          📦 Equipado
        </span>
      )
    case 'unico':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-dourado-claro px-3 py-1 text-xs font-bold text-dourado-escuro">
          ⭐ Único
        </span>
      )
    default:
      return null
  }
}

function PreviewItem({ item, estado }) {
  const [ativo, setAtivo] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAtivo((v) => !v)}
        className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-rosa-500 text-white hover:bg-rosa-600"
        aria-label={ativo ? 'Fechar prévia' : 'Ver prévia'}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
          {ativo ? (
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
          ) : (
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="none" stroke="currentColor" strokeWidth="2" />
          )}
        </svg>
      </button>
      <div className={`bloco shadow-[0_8px_0_0_var(--color-roxo-claro)] transition-transform duration-150 ${ativo ? 'scale-110' : ''}`}>
        <div className="flex aspect-video min-h-[200px] items-center justify-center overflow-hidden rounded-2xl bg-roxo-claro/40 p-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className={`${iconesTamanho(item.tamanho)} leading-none`}>
              {item.categoria === 'avatares' && <span className="text-5xl">🧸</span>}
              {item.categoria === 'molduras' && <span className="text-4xl">🖼️</span>}
              {item.categoria === 'baloes' && <span className="text-4xl">🫧</span>}
              {item.categoria === 'fondos' && <span className="text-4xl">🌈</span>}
              {item.categoria === 'telas' && <span className="text-4xl">🖥️</span>}
              {item.categoria === 'títulos' && <span className="text-4xl">👑</span>}
              {item.categoria === 'petiscos' && <span className="text-2xl">🍪</span>}
              {item.categoria === 'títulos' && <span className="text-2xl">🏆</span>}
              {item.categoria === 'petiscos' && <span className="text-2xl">🍬</span>}
              {item.categoria === 'molduras' && <span className="text-3xl">💍</span>}
              {item.categoria === 'fondos' && <span className="text-3xl">🗺️</span>}
            </span>
            <p className="max-w-xs text-xs font-bold text-roxo-escuro">{item.nome}</p>
            <span className="inline-flex items-center gap-1 font-bold text-dourado-escuro">
              <IconeMoeda size={16} />
              {item.preco} moedas
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Loja() {
  const navigate = useNavigate()
  const { state } = useKidsPlay()
  const [catalogo, setCatalogo] = useState(null)
  const [erro, setErro] = useState('')
  const [comprando, setComprando] = useState(null)
  const [confirmando, setConfirmando] = useState(null)
  const [anexando, setAnexando] = useState(null)
  const [apareceu, setApareceu] = useState(false)
  const [erroCompra, setErroCompra] = useState(null)

  const itensPorCategoria = useMemo(() => {
    const agrupados = {}
    for (const cat of categoriasLoja) agrupados[cat.id] = []
    for (const item of catalogo?.itens ?? []) {
      const categoria = cat.id
      if (!agrupados[categoria]) agrupados[categoria] = []
      agrupados[categoria].push(item)
    }
    return agrupados
  }, [catalogo])

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      try {
        const dados = await lerCatalogo()
        if (cancelado) return
        const erros = validarCatalogo(dados)
        if (erros.length > 0) {
          setErro('O arquivo de itens está com algum erro de formato. Ver o console e a lista abaixo.')
          setCatalogo({ itens: [], categorias_loja: [] })
          return
        }
        setErro('')
        setCatalogo(dados)
      } catch (err) {
        setErro('Não foi possível carregar os itens da loja. Tente novamente.')
        setCatalogo(null)
      }
    }
    carregar()
    return () => {
      cancelado = true
    }
  }, [])

  async function tentarComprar(id) {
    if (!eItemValido(catalogo, id)) {
      setErroCompra('Não é possível comprar esse item agora.')
      return
    }
    setAnexando(id)
    const resultado = await comprarItem(catalogo, state, id)
    setAnexando(null)
    if (resultado.sucesso) {
      setApareceu(true)
      setConfirmando(null)
      setErroCompra(null)
      const fala = dizer('compra_feita', { nome: estado.inventario[id] ?? 1, preco: catalogo.porId.get(id).preco, moedas: state.moedas })
      setTimeout(() => setApareceu(false), 1600)
      return
    }
    setErroCompra(resultado.mensagem)
    setConfirmando(null)
  }

  function ctx() {
    return {
      moedas: state.moedas,
      nivel: state.nivel,
      dias: state.dias_seguidos,
    }
  }

  function abrirConfirmacao(id, item) {
    setConfirmando({ id, item })
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Botao variante="secundario" onClick={() => navigate(-1)}>
              ← Voltar
            </Botao>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <span className="inline-flex items-center gap-1 text-base">
                <IconeBau size={28} />
                Loja
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-roxo-claro px-3 py-1 text-xs font-bold text-roxo-escuro">
              <IconeMoeda size={16} />
              {state.moedas} moedas
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-dourado-claro px-3 py-1 text-xs font-bold text-dourado-escuro">
              <IconePergaminho size={16} />
              {new Set(state.lista_desejos).size} desejos
            </span>
          </div>
        </header>

        {erro && (
          <div className="rounded-3xl border-4 border-vermelho-claro bg-vermelho-claro/20 p-4 text-sm font-bold text-vermelho-escuro" role="alert">
            ⚠️ {erro}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoriasLoja.map((cat) => {
            const itens = itensPorCategoria[cat.id] ?? []
            return (
              <div key={cat.id}>
                <h2 className="mb-3 rounded-2xl bg-roxo-claro/60 px-4 py-2 text-center text-sm font-bold text-roxo-escuro">
                  {cat.icone} {cat.nome}
                </h2>
                <div className="grid gap-3">
                  {itens.map((item) => {
                    const condicao = estadoLoja(catalogo, state, item.id)
                    const possuido = state.inventario?.[item.id] > 0
                    const temFalta = item.preco - state.moedas
                    return (
                      <Cartao key={item.id} className="flex flex-col justify-between p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <PreviewItem item={item} estado={state} />
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-lg font-bold">{item.preco}</span>
                            {item.preco === 0 && <span className="text-xs opacity-70">doação</span>}
                            {seloEstado(catalogo, state, item, item.id)}
                            {confirmando?.id === item.id && (
                              <div className="w-full rounded-2xl bg-white p-3 shadow-[0_6px_0_0_var(--color-roxo-claro)]">
                                <p className="text-sm font-bold text-roxo-escuro">Comprar {item.nome} por {item.preco} moedas?</p>
                                <div className="mt-2 flex justify-end gap-2">
                                  <Botao variante="secundario" onClick={() => setConfirmando(null)}>
                                    Agora não
                                  </Botao>
                                  <Botao variante="dourado" onClick={() => abrirConfirmacao(item.id, item)}>
                                    Sim, compra!
                                  </Botao>
                                </div>
                              </div>
                            )}
                            <Botao
                              variante={condicao === 'disponivel' ? 'dourado' : 'fantasma'}
                              onClick={() => {
                                if (condicao === 'disponivel' && !comprando && !confirmando) {
                                  setAnexando(item.id)
                                  tentarComprar(item.id)
                                } else if (condicao === 'disponivel') {
                                  setConfirmando({ id: item.id, item })
                                } else {
                                  setErroCompra('Item não disponível para compra.')
                                }
                              }}
                              disabled={comprando === item.id || anexando === item.id}
                            >
                              {comprando === item.id ? 'Comprando...' : confirmando?.id === item.id ? 'Seguro?' : 'Comprar'}
                            </Botao>
                            {temFalta > 0 && condicao === 'disponivel' && (
                              <p className="text-xs font-bold text-vermelho-escuro">Faltam {temFalta} moedas</p>
                            )}
                            {anexando === item.id && (
                              <p className="text-xs font-bold text-verde-escuro">Comprando...</p>
                            )}
                            {erroCompra && <p className="text-xs font-bold text-vermelho-escuro">{erroCompra}</p>}
                          </div>
                        </div>
                      </Cartao>
                    )
                  })}
                  {itens.length === 0 && (
                    <p className="text-center text-sm font-bold text-roxo-escuro/70">Nenhum item nessa categoria.</p>
                  )}
                </div>
              </div>
            )
          })}
        </section>

        {apareceu && <Confete quantidade={26} className="fixed inset-x-0 top-10 mx-auto max-w-2xl" />}
        {erroCompra && (
          <div className="mb-4 flex items-center justify-between rounded-3xl border-4 border-vermelho-claro bg-vermelho-claro/20 p-4 text-sm font-bold text-vermelho-escuro" role="alert">
            ⚠️ {erroCompra}
            <button type="button" onClick={() => setErroCompra(null)} aria-label="Fechar mensagem">✕</button>
          </div>
        )}
      </div>
    </Layout>
  )
}
