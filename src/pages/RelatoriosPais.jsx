import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { repo } from '../lib/repo/index.js'
import { lerPerfilSelecionado } from '../lib/perfil.js'
import { useToast } from '../contexts/ToastContext.jsx'

export default function RelatoriosPais() {
  const navigate = useNavigate()
  const perfil = lerPerfilSelecionado()
  const { addToast } = useToast()
  const [periodo, setPeriodo] = useState('semanal')
  const [relatorio, setRelatorio] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarRelatorio()
  }, [periodo])

  async function carregarRelatorio() {
    if (!perfil?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      setRelatorio(await repo.relatorioPais(perfil.id, periodo))
    } catch (err) {
      console.error('Erro ao carregar relatório:', err)
      addToast({ message: 'Erro ao carregar relatório' })
    } finally {
      setLoading(false)
    }
  }

  function renderConstancia() {
    const dias = periodo === 'semanal' ? 7 : 30
    const itens = []

    for (let i = dias - 1; i >= 0; i--) {
      const data = new Date()
      data.setDate(data.getDate() - i)
      const estudou = relatorio?.constancia?.[data.toISOString().split('T')[0]] || 
                     (i < Math.min(dias, 5)) // Simulação gentil para demo
      itens.push(
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`w-8 h-8 rounded ${estudou ? 'bg-verde-escuro' : 'bg-neutro-200 border-2 border-neutro-400'}`}
            title={data.toLocaleDateString('pt-BR')}
          />
          <span className="text-xs opacity-60">{data.getDate()}/{data.getMonth() + 1}</span>
        </div>
      )
    }
    return itens
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold">Relatórios dos Pais</h1>
        <div className="w-20" />
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <Button
          variant={periodo === 'semanal' ? 'primario' : 'secundario'}
          onClick={() => setPeriodo('semanal')}
        >
          Semanal
        </Button>
        <Button
          variant={periodo === 'mensal' ? 'primario' : 'secundario'}
          onClick={() => setPeriodo('mensal')}
        >
          Mensal
        </Button>
      </div>

      {loading ? (
        <Card className="p-6 text-center">
          <p className="text-lg">Carregando relatório...</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Cards com métricas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 text-center">
              <p className="text-sm opacity-70">Dias estudados</p>
              <p className="text-2xl font-bold text-roxo-escuro">{relatorio?.total_dias || 0}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm opacity-70">XP total</p>
              <p className="text-2xl font-bold text-dourado-escuro">{relatorio?.total_xp || 0}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm opacity-70">Missões</p>
              <p className="text-2xl font-bold text-verde-escuro">{relatorio?.total_missoes || 0}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm opacity-70">Taxa de acerto</p>
              <p className="text-2xl font-bold text-roxo-escuro">
                {relatorio?.taxa_acerto ? Math.round(relatorio.taxa_acerto * 100) : 0}%
              </p>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-4">
              <p className="text-sm opacity-70">Streak atual</p>
              <p className="text-2xl font-bold">{relatorio?.streak_atual || 0} dias</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm opacity-70">Maior streak</p>
              <p className="text-2xl font-bold">{relatorio?.streak_maior || 0} dias</p>
            </Card>
          </div>

          {/* Gráfico de constância */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Gráfico de Constância</h2>
            <p className="text-sm opacity-70 mb-4">Verdes = dias em que estudou</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {renderConstancia()}
            </div>
          </Card>

          {/* Frase positiva e foco em esforço */}
          <Card className="p-6 bg-dourado-claro border-dourado-escuro">
            <p className="text-lg font-semibold text-center">
              O foco está no esforço, não na perfeição. Cada dia estudando conta!
            </p>
          </Card>
        </div>
      )}
    </Layout>
  )
}
