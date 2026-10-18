// Lista de Desejos — corações nos itens e meta de moedas.
// Cada item mostra o estado (desejado, comprado, bloqueado, equipado).
// A faixa "Seu objetivo" soma o preço dos desejos e compara com as
// moedas do jogador.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Cartao from '../components/ui/Cartao.jsx'
import Botao from '../components/ui/Botao.jsx'
import BarraProgresso from '../components/ui/BarraProgresso.jsx'
import Confete from '../components/ui/Confete.jsx'
import { IconeMoeda, IconeDesejo } from '../components/ui/Icones.jsx'
import { useKidsPlay } from '../store/estado.js'
import { parsearCatalogo, estadoLoja, eConsumivel, eItemUnico, requisitoAtendido, dicaRequisito } from '../store/loja.js'
import { adicionarAoDesejo, removerDoDesejo, temNoDesejo, progressoDesejos } from '../store/listaDesejos.js'
import { lerCatalogo } from '../lib/lojaCatalogo.js'
import { validarCatalogo } from '../lib/validarCatalogo.js'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import { dizer } from '../components/kapivarus/falas.mjs'
import { categoriasLoja } from '../store/categorias.js'

export default function ListaDesejos() {
  const navigate = useNavigate()
  const { state } = useKidsPlay()
  const [catalogo, setCatalogo] = useState(null)
  const [erro, setErro] = useState('')
  const [desejando, setDesejando] = useState(null)
  const [confirma, setConfirma] = useState(null)
  const [apareceu, setApareceu] = useState(false)
  const [erroCompra, setErroCompra] = useState(null)

  const progresso = useMemo(() => progressoDesejos(catalogo), [catalogo])
  const itensDesejados = useMemo(() => {
    const ids = new Set(state.lista_desejos ?? [])
    return catalogo?.itens?.filter((item) => ids.has(item.id)) ?? []
  }, [catalogo, state.lista_desejos])

  const metaMoedas = useMemo(() => {
    let total = 0
    for (const item of itensDesejados) total += item.preco
    return total
  }, [itensDesejados])

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      try {
        const dados = await lerCatalogo()
        if (cancelado) return
        const erros = validarCatalogo(dados)
        if (erros.length > 0) {
          setErro('O arquivo de itens está com erros de formato. Ver o console.')
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

  useMemo(() => {
    if (!catalogo) return
    const erros = validarCatalogo(catalogo)
    if (erros.length > 0) {
      setErro('O arquivo de itens está com erros de formato. Ver o console.')
    }
  }, [catalogo])

  async function toggleDesejo(id) {
    const item = catalogo.porId.get(id)
    if (!item || item.venda === false) return
    if (temNoDesejo(id)) {
      await removerDoDesejo(id)
    } else {
      await adicionarAoDesejo(id)
    }
  }

  async function tentarComprar(id) {
    const item = catalogo.porId.get(id)
    if (!item || item.venda === false) {
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
    setDesejando(id)
    const resultado = await comprarItem(catalogo, state, id)
    setDesejando(null)
    if (resultado.sucesso) {
      setApareceu(true)
      setConfirma(null)
      setErroCompra(null)
      const fala = dizer('compra_feita', { nome: estado.inventario[id] ?? 1, preco: item.preco, moedas: state.moedas })
      setTimeout(() => setApareceu(false), 1600)
      return
    }
    setErroCompra(resultado.mensagem)
    setConfirma(null)
  }

  function abrirConfirmacao(id, item) {
    setConfirma({ id, item })
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
                <IconeDesejo size={28} />
                Lista de Desejos
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-roxo-claro px-3 py-1 text-xs font-bold text-roxo-escuro">
              <IconeMoeda size={16} />
              {state.moedas} moedas
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-dourado-claro px-3 py-1 text-xs font-bold text-dourado-escuro">
              {progresso.item}/{progresso.total} desejos
            </span>
          </div>
        </header>

        {erro && (
          <div className="rounded-3xl border-4 border-vermelho-claro bg-vermelho-claro/20 p-4 text-sm font-bold text-vermelho-escuro" role="alert">
            ⚠️ {erro}
          </div>
        )}

        {progresso.total === 0 ? (
          <Cartao className="p-6 text-center">
            <p className="text-lg font-bold">Ainda não tem itens para desejar.</p>
            <p className="mt-1 text-sm opacity-80">Que tal visitar a loja?</p>
            <Botao variante="dourado" onClick={() => navigate('/loja')}>
              Abrir Loja
            </Botao>
          </Cartao>
        ) : (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {itensDesejados.map((item) => {
              const condicao = estadoLoja(catalogo, state, item.id)
              const possuido = state.inventario?.[item.id] > 0 ?? false
              const consumivel = eConsumivel(catalogo, item.id)
              const unico = eItemUnico(catalogo, item.id)
              const temFalta = item.preco - state.moedas
              return (
                <Cartao key={item.id} className="flex flex-col justify-between p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`text-4xl ${item.tamanho === 'grande' ? 'text-5xl' : 'text-3xl'}`}>🧸</span>
                      <p className="text-sm font-bold text-roxo-escuro">{item.nome}</p>
                      <p className="text-xs opacity-70">{item.descricao || ''}</p>
                      <span className="text-xs font-bold text-dourado-escuro">{item.preco} moedas</span>
                      {consumivel && <span className="text-xs font-bold text-azul-escuro">Consumível</span>}
                      {unico && <span className="text-xs font-bold text-dourado-escuro">Único</span>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-dourado-claro px-3 py-1 text-xs font-bold text-dourado-escuro">
                        <IconeDesejo size={14} />
                        {condicao === 'disponivel' ? (
                          <>
                            <span className="text-xs font-bold text-dourado-escuro">Disponível</span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-roxo-escuro">Bloqueado</span>
                        )}
                      </span>
                      {temFalta > 0 && condicao === 'disponivel' && (
                        <p className="text-xs font-bold text-vermelho-escuro">Faltam {temFalta} moedas</p>
                      )}
                      {condicao === 'bloqueado' && (
                        <p className="text-xs font-bold text-roxo-escuro">{dicaRequisito(item)}</p>
                      )}
                      {possuto && (
                        <p className="text-xs font-bold text-verde-escuro">✓ Comprado</p>
                      )}
                      <Botao
                        variante={condicao === 'disponivel' ? 'dourado' : 'fantasma'}
                        onClick={() => {
                          if (condicao === 'disponivel') {
                            setConfirma({ id: item.id, item })
                          } else {
                            setErro('Item não disponível para a lista.')
                          }
                        }}
                      >
                        {confirma?.id === item.id ? 'Seguro?' : 'Desejar'}
                      </Botao>
                    </div>
                  </div>
                </Cartao>
              )
            })}
          </section>
        )}

        {itensDesejados.length > 0 && (
          <Cartao className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Seu objetivo</span>
                <span>
                  {metaMoedas} moedas
                  {state.moedas > 0 && <span className="text-xs opacity-70">({metaMoedas - state.moedas} faltando)</span>}
                </span>
              </div>
              <BarraProgresso valor={Math.min(1, metaMoedas / 100)} />
            </div>
          </Cartao>
        )}
      </div>
    </Layout>
  )
}
