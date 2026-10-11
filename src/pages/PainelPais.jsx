import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useToast } from '../contexts/ToastContext.jsx'

export default function PainelPais() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { addToast } = useToast()
  const [criancas, setCriancas] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmarExclusao, setConfirmarExclusao] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    if (!usuario || !supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('guardian_id', usuario.id)
      if (error) throw error
      setCriancas(data || [])
    } catch (e) {
      addToast({ message: e.message })
    } finally {
      setLoading(false)
    }
  }

  async function exportarDados(criancaId) {
    try {
      const { data, error } = await supabase.rpc('exportar_dados', { crianca_id_param: criancaId })
      if (error) throw error
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dados-crianca-${criancaId}.json`
      a.click()
      URL.revokeObjectURL(url)
      addToast({ message: 'Dados exportados' })
    } catch (e) {
      addToast({ message: e.message })
    }
  }

  async function excluirCrianca(criancaId) {
    if (confirmarExclusao !== 'EXCLUIR') {
      addToast({ message: 'Digite EXCLUIR para confirmar' })
      return
    }
    setExcluindo(true)
    try {
      const { error } = await supabase.rpc('excluir_crianca', { crianca_id_param: criancaId, confirmacao: 'EXCLUIR' })
      if (error) throw error
      addToast({ message: 'Criança excluída com anonimização' })
      await carregarDados()
    } catch (e) {
      addToast({ message: e.message })
    } finally {
      setExcluindo(false)
    }
  }

  if (loading) {
    return <Layout><Card className="p-6">Carregando...</Card></Layout>
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>← Voltar</Button>
        <h1 className="text-2xl font-bold">Painel dos Pais</h1>
        <div className="w-20" />
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-3">Resumo Semanal</h2>
          <p className="opacity-70">Foco em esforço e constância. Nunca comparações entre crianças.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-3">Privacidade e Controles</h2>
          {criancas.map(c => (
            <div key={c.id} className="mb-4 p-3 border-2 border-roxo-claro rounded-xl">
              <p className="font-semibold">{c.nickname}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="secundario" onClick={() => exportarDados(c.id)}>Baixar dados (JSON)</Button>
                <Button variant="secundario" onClick={() => excluirCrianca(c.id)} disabled={excluindo}>Excluir criança</Button>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <label className="block text-sm mb-2">Digite EXCLUIR para confirmar exclusão</label>
            <input
              value={confirmarExclusao}
              onChange={(e) => setConfirmarExclusao(e.target.value)}
              className="border-2 border-roxo-claro rounded p-2 w-full"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-3">Controles de Consentimento</h2>
          <p className="opacity-70">Revogar consentimentos afeta apenas o uso futuro. Dados já coletados seguem política de retenção.</p>
        </Card>

        <Card className="p-6 bg-dourado-claro border-dourado-escuro">
          <h2 className="text-lg font-bold mb-2">Importante</h2>
          <p className="text-sm">O app é reforço escolar gamificado, não diagnóstico/tratamento. Nunca coletamos dados de saúde.</p>
        </Card>
      </div>
    </Layout>
  )
}
