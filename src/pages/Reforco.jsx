import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useMemo } from 'react'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import { dizer } from '../components/kapivarus/falas.mjs'
import { lerPerfilSelecionado } from '../lib/perfil.js'

export default function Reforco() {
  const navigate = useNavigate()
  const perfil = lerPerfilSelecionado()
  const contexto = useMemo(() => ({ nome: perfil?.nickname || perfil?.nome || '' }), [perfil])
  const falaTreino = useMemo(() => dizer('treino_revisao', contexto), [contexto])

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>← Voltar</Button>
        <h1 className="text-2xl font-bold">Treino do Kapivarus</h1>
        <div className="w-20" />
      </div>

      <div className="space-y-6">
        <Card className="p-6 text-center">
          <p className="text-lg mb-4">Vamos reforçar um pouquinho do que você precisa praticar!</p>
          <Button>Começar treino</Button>
        </Card>

        <div className="flex justify-center">
          <KapivarusFala pose={falaTreino.estado} tom="dica" efeito={falaTreino.efeito} texto={falaTreino.texto} />
        </div>

        <Card className="p-4 text-center bg-dourado-claro border-dourado-escuro">
          <p className="text-sm">O foco é no esforço, não na perfeição. Sessões curtas e gentis.</p>
        </Card>
      </div>
    </Layout>
  )
}
