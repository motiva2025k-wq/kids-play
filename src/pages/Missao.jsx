import { useNavigate } from "react-router-dom"
import KapivarusFala from "../components/kapivarus/KapivarusFala.jsx"
import Button from "../components/ui/Button.jsx"
import ProgressBar from "../components/ui/ProgressBar.jsx"
import Layout from "../components/Layout.jsx"
import { pegarFraseAleatoria } from "../data/frasesKapivarus.js"

export default function Missao() {
  const navegar = useNavigate()
  const alternativas = ["Cachorro", "Gato", "Capivara", "Coelho"]

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navegar(-1)}>← Voltar</Button>
        <Button variant="secundario" onClick={() => {}}>Pausar</Button>
      </div>

      <ProgressBar atual={1} total={5} rotulo="Progresso da missão" className="mb-6" />

      <div className="mb-6 flex justify-center">
        <div className="bloco max-w-2xl px-6 py-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Qual animal é o nosso tutor?</h1>
          <p className="mt-2 text-lg opacity-80">Toque na resposta certa</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        {alternativas.map((alt) => (
          <button
            key={alt}
            type="button"
            onClick={() => navegar("/acerto")}
            className="btn-jogo btn-afunda bloco min-h-[56px] px-4 py-4 text-left text-xl font-bold hover:bg-verde-claro"
          >
            {alt}
          </button>
        ))}
        <button
          type="button"
          onClick={() => navegar("/erro-gentil")}            className="btn-jogo btn-afunda bloco min-h-[56px] px-4 py-4 text-left text-xl font-bold hover:bg-vermelho-claro-suave"
        >
          Urso
        </button>
      </div>

      <div className="flex justify-center">
        <KapivarusFala pose="pensando" tom="dica" texto={pegarFraseAleatoria("dica")} />
      </div>
    </Layout>
  )
}
