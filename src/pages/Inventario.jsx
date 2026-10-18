// Inventário — itens possuídos por categoria, equipar/desequipar e
// consumíveis com quantidade. Abre a prévia e a confirmação de compra.
// Lista de desejos com progresso até as moedas.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Cartao from '../components/ui/Cartao.jsx'
import Botao from '../components/ui/Botao.jsx'
import BarraProgresso from '../components/ui/BarraProgresso.jsx'
import Confete from '../components/ui/Confete.jsx'
import { IconeEquipment, IconeMoeda, IconeCadeado, IconeDesejo } from '../components/ui/Icones.jsx'
import { useKidsPlay } from '../store/estado.js'
import { parsearCatalogo, estadoLoja, eConsumivel, eItemUnico, comprarItem, requisitoAtendido } from '../store/loja.js'
import { categoriasLoja } from '../store/categorias.js'
import { validarCatalogo } from '../lib/validarCatalogo.js'
import { lerCatalogo } from '../lib/lojaCatalogo.js'
import { adicionarAoDesejo, removerDoDesejo, progressoDesejos } from '../store/listaDesejos.js'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import { dizer } from '../components/kapivarus/falas.mjs'

function IconeTamanho({ tamanho, className = '' }) {
  if (tamanho === 'grande') return <span className={`text-5xl ${className}`}>🖥️</span>
  if (tamanho === 'medio') return <span className={`text-4xl ${className}`}>🖼️</span>
  return <span className={`text-3xl ${className}`}>🧸</span>
}

function SeloEquipar({ mesclado }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-azul-claro px-3 py-1 text-xs font-bold text-azul-escuro">
      <IconeEquipment size={14} />
      {mesclado ? 'Ativo' : 'Equipável'}
    </span>
  )
}

export default function Inventario() {
  const navigate = useNavigate()
  const { state } = useKidsPlay()
  const [catalogo, setCatalogo] = useState(null)
  const [erro, setErro] = useState('')
  const [comprando, setComprando] = useState(null)
  const [confirmando, setConfirmando] = useState(null)
  const [anexando, setAnexando] = useState(null)
  const [apareceu, setApareceu] = useState(false)
  const [erroCompra, setErroCompra] = useState(null)
  const [voz, setVoz] = useState(false)

  const itens = useMemo(() => {
    const agrupados = {}
    for (const cat of categoriasLoja) agrupados[cat.id] = []
    for (const item of catalogo?.itens ?? []) {
      const categoria = item.categoria ?? 'outros'
      if (!agrupados[categoria]) agrupados[categoria] = []
      agrupados[categoria].push(item)
    }
    return agrupados
  }, [catalogo])

  const progresso = useMemo(() => progressoDesejos(catalogo), [catalogo])
  const desejos = new Set(state.lista_desejos ?? [])

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      try {
        const dados = await lerCatalogo()
        if (cancelado) return
        const erros = validarCatalogo(dados)
        if (erros.length > 0) {
          setErro('O arquivo de itens está com algum erro de formato. Ver o console.')
          setCatalogo({ itens: [], categorias_loja: [] })
          return
        }
        setErro('')
        setCatalogo(dados)
      } catch {
        setErro('Não foi possível carregar os itens do inventário.')
        setCatalogo(null)
      }
    }
    carregar()
    return () => {
      cancelado = true
    }
  }, [])

  function ctx() {
    return {
      moedas: state.moedas,
      nivel: state.nivel,
      dias: state.dias_seguidos,
    }
  }

  async function tentarComprar(id) {
    const item = catalogo.porId.get(id)
    if (!item || item.venda === false || item.unico === false) {
      setErroCompra('Esse item só é ganho em missões e eventos.')
      return
    }
    if (item.unico === true) {
      setErroCompra('Esse item só pode ser ganho uma vez.')
      return
    }
    if (item.requisito && !requisitoAtendido(catalogo, state, item)) {
      setErroCompra(dicaRequisito(item))
      return
    }
    if (state.moedas < item.preco) {
      setErroCompra(`Faltam ${item.preco - state.moedas} moedas para comprar.`)
      return
    }
    if (state.inventario?.[id] > 0) {
      setErroCompra('Você já tem esse item.')
      return
    }
    setAnexando(id)
    const resultado = await comprarItem(catalogo, state, id)
    setAnexando(null)
    if (resultado.sucesso) {
      setApareceu(true)
      setConfirmando(null)
      setErroCompra(null)
      const fala = dizer('compra_feita', { nome: state.inventario[id] ?? 1, preco: item.preco, moedas: state.moedas })
      setTimeout(() => setApareceu(false), 1600)
      return
    }
    setErroCompra(resultado.mensagem)
    setConfirmando(null)
  }

  function abrirConfirmacao(id, item) {
    setConfirmando({ id, item })
  }

  async function toggleDesejo(id) {
    const item = catalogo.porId.get(id)
    if (!item || item.venda === false) return
    if (temNoDesejo(id)) {
      await removerDoDesejo(id)
    } else {
      await adicionarAoDesejo(id)
    }
  }

  function slotTarget(item) {
    if (item.categoria === 'avatares') return 'avatar'
    if (item.categoria === 'molduras') return 'moldura_fundo'
    if (item.categoria === 'baloes') return 'balao'
    if (item.categoria === 'telas') return 'cenario'
    if (item.categoria === 'títulos') return 'titulo'
    return null
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
                <IconeEquipment size={28} />
                Inventário
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-roxo-claro px-3 py-1 text-xs font-bold text-roxo-escuro">
              <IconeMoeda size={16} />
              {state.moedas} moedas
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-dourado-claro px-3 py-1 text-xs font-bold text-dourado-escuro">
              <IconeDesejo size={16} />
              {progresso.item}/{progresso.total} desejos
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
            const itensCategoria = itens[cat.id] ?? []
            return (
              <div key={cat.id}>
                <h2 className="mb-3 rounded-2xl bg-roxo-claro/60 px-4 py-2 text-center text-sm font-bold text-roxo-escuro">
                  {cat.icone} {cat.nome}
                </h2>
                <div className="grid gap-3">
                  {itensCategoria.map((item) => {
                    const condicao = estadoLoja(catalogo, state, item.id)
                    const possuido = state.inventario?.[item.id] > 0 ?? false
                    const eq = state.equipados?.[slotTarget(item)] === item.id
                    const consumivel = eConsumivel(catalogo, item.id)
                    const unico = eItemUnico(catalogo, item.id)
                    const temFalta = item.preco - state.moedas
                    return (
                      <Cartao key={item.id} className="flex flex-col justify-between p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex flex-col items-center gap-2">
                            <IconeTamanho tamanho={item.tamanho} />
                            <p className="text-sm font-bold text-roxo-escuro">{item.nome}</p>
                            <p className="text-xs opacity-70">{item.descricao || ''}</p>
                            <span className="text-xs font-bold text-dourado-escuro">{item.preco} moedas</span>
                            <SeloEquipar mesclado={eq} />
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {seloEstado(catalogo, state, item.id)}
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
                  {itensCategoria.length === 0 && (
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
