import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

export default function Privacidade() {
  const navigate = useNavigate()
  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>← Voltar</Button>
        <h1 className="text-2xl font-bold">Política de Privacidade</h1>
        <div className="w-20" />
      </div>
      <Card className="p-6 space-y-4">
        <p className="font-semibold text-yellow-700 bg-yellow-100 p-3 rounded">AVISO: Texto em revisão. Não utilizar em produção sem validação jurídica.</p>
        <p>Kids_Play é um reforço escolar gamificado. Coletamos o mínimo necessário para funcionamento.</p>
        <p>Sem anúncios, sem venda de dados, sem rastreadores de terceiros.</p>
        <p>Consentimento específico e separável. Direitos de exportação e exclusão garantidos.</p>
      </Card>
    </Layout>
  )
}
