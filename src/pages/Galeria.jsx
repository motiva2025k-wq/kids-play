import Kapivarus, { POSES_KAPIVARUS } from '../components/kapivarus/Kapivarus.jsx'
import Layout from '../components/Layout.jsx'
import Cartao from '../components/ui/Cartao.jsx'

// Galeria oficial do Kapivarus: as 9 poses e o momento de uso de cada uma.
// É a referência visual do projeto — quando o app pedir "Kapivarus comemorando",
// é daqui que saem.
export default function Galeria() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold">Kapivarus — todas as poses</h1>
      <p className="mb-6 opacity-80">
        Nosso tutor: capivara sábia, com coroa dourada, óculos redondos e capa de
        rei. Cada pose tem um momento certo de aparecer.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POSES_KAPIVARUS.map((pose) => (
          <Cartao key={pose.id} className="flex flex-col items-center text-center">
            <Kapivarus pose={pose.id} tamanho={170} />
            <h2 className="mt-2 text-xl font-bold">{pose.nome}</h2>
            <p className="text-sm opacity-80">{pose.momento}</p>
          </Cartao>
        ))}
      </div>
    </Layout>
  )
}
