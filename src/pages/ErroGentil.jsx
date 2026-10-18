import { useNavigate } from "react-router-dom"
import KapivarusFala from "../components/kapivarus/KapivarusFala.jsx"
import Button from "../components/ui/Button.jsx"
import Layout from "../components/Layout.jsx"
import { dizer } from "../components/kapivarus/falas.mjs"
import { lerPerfilSelecionado } from "../lib/perfil.js"
import { useMemo } from "react"

export default function ErroGentil() {
  const navegar = useNavigate()
  const perfil = lerPerfilSelecionado()
  const contexto = useMemo(() => ({ nome: perfil?.nickname || perfil?.nome || "" }), [perfil])
  const falaErro = useMemo(() => dizer("erro", contexto), [contexto])
  return (
    <Layout>
      <div className="flex flex-col items-center gap-6 text-center">
        <KapivarusFala pose={falaErro.estado} tom="incentivo" efeito={falaErro.efeito} texto={falaErro.texto} />
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
