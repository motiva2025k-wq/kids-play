import { useNavigate } from "react-router-dom"
import Kapivarus from "../components/kapivarus/Kapivarus.jsx"
import Badge from "../components/ui/Badge.jsx"
import Button from "../components/ui/Button.jsx"
import Layout from "../components/Layout.jsx"

export default function Home() {
  const navegar = useNavigate()
  const missoes = [
    { id: 1, nome: "Aldeia", feito: true },
    { id: 2, nome: "Floresta", feito: false },
    { id: 3, nome: "Montanha", feito: false },
  ]

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tipo="xp" valor={150} />
          <Badge tipo="moedas" valor={25} />
          <Badge tipo="nivel" valor={3} />
          <Badge tipo="streak" valor={7} />
        </div>
        <Button variant="secundario" onClick={() => navegar("/guia-visual")}>Guia visual</Button>
      </div>

      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Kapivarus pose="feliz" size={120} />
        <div className="bloco max-w-xl px-6 py-4">
          <h1 className="text-2xl font-bold">Oi, aventureiro(a)! Vamos começar nossa trilha?</h1>
          <p className="mt-1 text-lg">Um objetivo por tela. Sem pressa, sempre juntos!</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bloco flex h-12 w-12 items-center justify-center text-xl font-bold bg-dourado-claro">★</div>
            <button
              type="button"
              onClick={() => navegar("/reforco")}
              className="btn-afunda bloco flex-1 px-4 py-3 text-left text-lg font-bold hover:bg-roxo-claro"
            >
              Treino do Kapivarus
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-xl font-bold">Trilha de missões</h2>
        <div className="space-y-3">
          {missoes.map((m, idx) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className={`bloco flex h-12 w-12 items-center justify-center text-xl font-bold ${m.feito ? "bg-verde-claro" : "bg-white"}`}>
                {m.feito ? "✓" : idx + 1}
              </div>
              <button
                type="button"
                onClick={() => navegar("/missao")}
                className="btn-afunda bloco flex-1 px-4 py-3 text-left text-lg font-bold hover:bg-roxo-claro"
              >
                Missão {m.id} — {m.nome}
              </button>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}
