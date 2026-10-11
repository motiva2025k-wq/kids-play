import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

export default function SegurancaParaPais() {
  const navigate = useNavigate()
  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>← Voltar</Button>
        <h1 className="text-2xl font-bold">Segurança para Pais</h1>
        <div className="w-20" />
      </div>
      <Card className="p-6 space-y-4">
        <p className="font-semibold text-yellow-700 bg-yellow-100 p-3 rounded">AVISO: Texto em revisão.</p>
        <p>Privacidade por padrão. Fotos não exibidas sem consentimento explícito.</p>
        <p>Dados exportáveis e excluíveis. Sem coleta de dados de saúde.</p>
      </Card>
    </Layout>
  )
}
