import { useNavigate } from "react-router-dom"
import KapivarusFala from "../components/kapivarus/KapivarusFala.jsx"
import Button from "../components/ui/Button.jsx"
import Layout from "../components/Layout.jsx"
import { pegarFraseAleatoria } from "../data/frasesKapivarus.js"

export default function ErroGentil() {
  const navegar = useNavigate()
  return (
    <Layout>
      <div className="flex flex-col items-center gap-6 text-center">
        <KapivarusFala pose="incentivando" tom="incentivo" texto={pegarFraseAleatoria("incentivo")} />
        <div className="bloco max-w-xl px-6 py-6">
          <h1 className="text-3xl font-bold">Quase lá!</h1>
          <p className="mt-2 text-lg">Erro sem perda de pontos. Vamos tentar de novo com calma?</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navegar("/missao")}>Tentar de novo</Button>
          <Button variant="secundario" onClick={() => navegar("/")}>Voltar pra trilha</Button>
        </div>
      </div>
    </Layout>
  )
}
