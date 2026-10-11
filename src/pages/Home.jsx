// Home — trilha de missões com tema de jogo.
// HUD com ícones, botões grandes estilo jogo; textos e lógica inalterados.
import { useNavigate } from "react-router-dom"
import Kapivarus from "../components/kapivarus/Kapivarus.jsx"
import Button from "../components/ui/Button.jsx"
import Layout from "../components/Layout.jsx"
import HudItem from "../components/ui/HudItem.jsx"
import {
  IconeChama,
  IconeCoroa,
  IconeMoeda,
  IconePergaminho,
  IconeEstrela,
} from "../components/ui/Icones.jsx"

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
        {/* HUD do jogador — mesmos valores do Badges (XP 150, Moedas 25, Nível 3, Streak 7) */}
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          <HudItem icone={<IconeEstrela size={26} />} animar="estrela-pulsar" cor="dourado" rotulo="XP" valor={150} />
          <HudItem icone={<IconeMoeda size={26} />} animar="moeda-girar" cor="verde" rotulo="Moedas" valor={25} />
          <HudItem icone={<IconeCoroa size={26} />} cor="roxo" rotulo="Nível" valor={3} />
          <HudItem icone={<IconeChama size={26} />} animar="chama-balancar" cor="laranja" rotulo="Dias seguidos" valor={7} />
        </div>
        <Button variant="secundario" onClick={() => navegar("/guia-visual")}>Guia visual</Button>
      </div>

      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        {/* Exemplo do componente reutilizável: estado + balão de fala + tamanho "m" */}
        <Kapivarus
          estado="feliz"
          mensagem="Oi, aventureiro(a)! Vamos começar nossa trilha?"
          tom="dica"
          tamanho="m"
        />
        <div className="bloco max-w-xl px-6 py-4">
          <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
          <p className="mt-1 text-lg">Um objetivo por tela. Sem pressa, sempre juntos!</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bloco flex h-12 w-12 items-center justify-center bg-dourado-claro">
              <IconePergaminho size={26} />
            </div>
            <button
              type="button"
              onClick={() => navegar("/reforco")}
              className="btn-jogo btn-afunda bloco flex-1 px-4 py-3 text-left text-lg font-bold hover:bg-roxo-claro"
            >
              Treino do Kapivarus
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <IconePergaminho size={24} />
          Trilha de missões
        </h2>
        <div className="space-y-3">
          {missoes.map((m, idx) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className={`bloco flex h-12 w-12 items-center justify-center text-xl font-bold ${m.feito ? "bg-verde-claro" : "bg-white"}`}>
                {m.feito ? "✓" : idx + 1}
              </div>
              <button
                type="button"
                onClick={() => navegar("/missao")}
                className="btn-jogo btn-afunda bloco flex-1 px-4 py-3 text-left text-lg font-bold hover:bg-roxo-claro"
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
