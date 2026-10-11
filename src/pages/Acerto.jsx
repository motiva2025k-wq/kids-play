import { useNavigate } from "react-router-dom"
import KapivarusFala from "../components/kapivarus/KapivarusFala.jsx"
import Button from "../components/ui/Button.jsx"
import Layout from "../components/Layout.jsx"
import { pegarFraseAleatoria } from "../data/frasesKapivarus.js"

export default function Acerto() {
  const navegar = useNavigate()
  return (
    <Layout>
      <div className="flex flex-col items-center gap-6 text-center">
        <KapivarusFala pose="comemorando" tom="acerto" texto={pegarFraseAleatoria("acerto")} />
        <div className="bloco max-w-xl px-6 py-6">
          <h1 className="text-3xl font-bold">Acertou!</h1>
          <p className="mt-2 text-lg">Você fez um ótimo raciocínio. Continue assim!</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navegar("/missao")}>Próxima missão</Button>
          <Button variant="secundario" onClick={() => navegar("/")}>Voltar pra trilha</Button>
        </div>
      </div>
    </Layout>
  )
}
