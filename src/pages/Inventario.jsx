import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { supabase } from '../lib/supabase.js'
import { lerPerfilSelecionado } from '../lib/perfil.js'
import { useToast } from '../contexts/ToastContext.jsx'

export default function Inventario() {
  const navigate = useNavigate()
  const perfil = lerPerfilSelecionado()
  const { addToast } = useToast()
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [equipando, setEquipando] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    if (!perfil?.id || !supabase) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('inventario')
        .select(`
          *,
          loja_itens (*)
        `)
        .eq('child_id', perfil.id)
        .order('adquirido_em', { ascending: false })

      if (error) throw error
      setItens(data || [])
    } catch (err) {
      console.error('Erro ao carregar inventário:', err)
      addToast({ message: 'Erro ao carregar inventário' })
    } finally {
      setLoading(false)
    }
  }

  async function equiparItem(item) {
    if (!perfil?.id || !supabase) return

    setEquipando(item.id)
    try {
      const { error } = await supabase.rpc('equipar_item', {
        child_id_param: perfil.id,
        item_id_param: item.item_id
      })

      if (error) throw error
      addToast({ message: `Equipou ${item.loja_itens.nome}!` })
      await carregarDados()
    } catch (err) {
      console.error('Erro ao equipar:', err)
      addToast({ message: err.message || 'Erro ao equipar item' })
    } finally {
      setEquipando(null)
    }
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold">Inventário</h1>
        <div className="w-20" />
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <Button variant="secundario" onClick={() => navigate('/loja')}>
          Ir para Loja
        </Button>
      </div>

      {loading ? (
        <Card className="p-6 text-center">
          <p className="text-lg">Carregando inventário...</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {itens.map(item => (
            <Card key={item.id} className="p-4 flex flex-col justify-between">
              <div className="mb-4">
                <h2 className="text-lg font-bold mb-2">{item.loja_itens?.nome}</h2>
                {item.loja_itens?.descricao && (
                  <p className="text-sm opacity-80 mb-2">{item.loja_itens.descricao}</p>
                )}
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Tipo: {item.loja_itens?.tipo}</span>
                  {item.equipado && (
                    <span className="font-semibold text-verde-escuro">✓ Equipado</span>
                  )}
                </div>
              </div>
              {!item.equipado && (
                <Button
                  onClick={() => equiparItem(item)}
                  disabled={equipando === item.id}
                  variant="secundario"
                >
                  {equipando === item.id ? 'Equipando...' : 'Equipar'}
                </Button>
              )}
              {item.equipado && (
                <Button variant="secundario" disabled>
                  Equipado
                </Button>
              )}
            </Card>
          ))}
          {itens.length === 0 && (
            <Card className="p-6 text-center col-span-full">
              <p className="text-lg">Seu inventário está vazio</p>
              <Button className="mt-4" onClick={() => navigate('/loja')}>
                Ir para Loja
              </Button>
            </Card>
          )}
        </div>
      )}
    </Layout>
  )
}
