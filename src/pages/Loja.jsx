import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { IconeBau, IconeMoeda } from '../components/ui/Icones.jsx'
import { supabase } from '../lib/supabase.js'
import { lerPerfilSelecionado } from '../lib/perfil.js'
import { useToast } from '../contexts/ToastContext.jsx'

export default function Loja() {
  const navigate = useNavigate()
  const perfil = lerPerfilSelecionado()
  const { addToast } = useToast()
  const [itens, setItens] = useState([])
  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(true)
  const [comprando, setComprando] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    if (!supabase) return

    setLoading(true)
    try {
      const [itensRes, inventarioRes] = await Promise.all([
        supabase.from('loja_itens').select('*').eq('ativo', true).order('preco', { ascending: true }),
        perfil?.id ? supabase.from('inventario').select('item_id').eq('child_id', perfil.id) : { data: [] }
      ])

      if (itensRes.error) throw itensRes.error
      if (inventarioRes.error) throw inventarioRes.error

      setItens(itensRes.data || [])
      setInventario((inventarioRes.data || []).map(i => i.item_id))
    } catch (err) {
      console.error('Erro ao carregar loja:', err)
      addToast({ message: 'Erro ao carregar loja' })
    } finally {
      setLoading(false)
    }
  }

  async function comprarItem(item) {
    if (!perfil?.id || !supabase) return

    setComprando(item.id)
    try {
      const { data, error } = await supabase.rpc('comprar_item', {
        child_id_param: perfil.id,
        item_id_param: item.id
      })

      if (error) throw error
      addToast({ message: `Comprou ${item.nome} com sucesso!` })
      await carregarDados()
    } catch (err) {
      console.error('Erro ao comprar:', err)
      addToast({ message: err.message || 'Erro ao comprar item' })
    } finally {
      setComprando(null)
    }
  }

  function jaPossui(itemId) {
    return inventario.includes(itemId)
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>
          ← Voltar
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <span className="moeda-girar inline-flex">
            <IconeBau size={26} />
          </span>
          Loja
        </h1>
        <div className="w-20" />
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <Button variant="secundario" onClick={() => navigate('/inventario')}>
          Ver Inventário
        </Button>
      </div>

      {loading ? (
        <Card className="p-6 text-center">
          <p className="text-lg">Carregando loja...</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {itens.map(item => (
            <Card key={item.id} className="p-4 flex flex-col justify-between">
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-bold">{item.nome}</h2>
                {item.descricao && <p className="mb-2 text-sm opacity-80">{item.descricao}</p>}
                <span className="inline-flex items-center gap-1.5 font-semibold text-verde-escuro">
                  <IconeMoeda size={18} />
                  {item.preco} moedas
                </span>
                <span className="ml-2 text-xs opacity-60">({item.tipo})</span>
              </div>
              {jaPossui(item.id) ? (
                <Button variant="secundario" disabled>
                  ✅ Já adquirido
                </Button>
              ) : (
                <Button
                  className="btn-jogo"
                  onClick={() => comprarItem(item)}
                  disabled={comprando === item.id}
                >
                  {comprando === item.id ? 'Comprando...' : '🛍️ Comprar'}
                </Button>
              )}
            </Card>
          ))}
          {itens.length === 0 && (
            <Card className="p-6 text-center col-span-full">
              <p className="text-lg">Nenhum item disponível na loja</p>
            </Card>
          )}
        </div>
      )}
    </Layout>
  )
}
