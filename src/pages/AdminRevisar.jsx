import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isAdmin } from '../lib/admin.js'
import { useToast } from '../contexts/ToastContext.jsx'

export default function AdminRevisar() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { addToast } = useToast()
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase.from('lotes_importacao').select('*').order('importado_em', { ascending: false })
      if (error) throw error
      setLotes(data || [])
    } catch (e) {
      addToast({ message: e.message })
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin(usuario)) {
    return (
      <Layout>
        <Card className="p-6 text-center">
          <p className="text-lg">Acesso negado</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>← Voltar</Button>
        <h1 className="text-2xl font-bold">Revisar Lotes</h1>
        <div className="w-20" />
      </div>

      <div className="mb-6">
        <Button onClick={() => navigate('/admin/importar')}>Novo Lote</Button>
      </div>

      {loading ? (
        <Card className="p-6 text-center">Carregando...</Card>
      ) : (
        <div className="space-y-2">
          {lotes.map(lote => (
            <Card key={lote.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{lote.lote_id}</p>
                <p className="text-sm opacity-80">{lote.ano}º ano • {lote.materia} • {lote.qtd_perguntas} perguntas</p>
                <p className="text-xs opacity-60">{new Date(lote.importado_em).toLocaleString('pt-BR')}</p>
              </div>
              <Button variant="secundario">Revisar</Button>
            </Card>
          ))}
          {lotes.length === 0 && (
            <Card className="p-6 text-center">Nenhum lote importado</Card>
          )}
        </div>
      )}
    </Layout>
  )
}
