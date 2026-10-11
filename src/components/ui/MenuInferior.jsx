// Menu inferior de jogo — ícones grandes, coloridos e rótulos curtos.
// Mobile-first: fixo no rodapé; esconde em telas médias (>=sm) onde o
// espaço horizontal é suficiente para navegar pelas telas.
import { useLocation, useNavigate } from "react-router-dom"
import { IconeAvatar, IconeBau, IconeCoroa, IconePergaminho, IconeEstrela } from "./Icones.jsx"

const ITENS = [
  { rota: "/home", rotulo: "Início", Icone: IconeEstrela },
  { rota: "/missao", rotulo: "Missões", Icone: IconePergaminho },
  { rota: "/ranking", rotulo: "Ranking", Icone: IconeCoroa },
  { rota: "/loja", rotulo: "Loja", Icone: IconeBau },
  { rota: "/painel", rotulo: "Perfil", Icone: IconeAvatar },
]

export default function MenuInferior() {
  const navegar = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Menu principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-roxo-escuro bg-white/95 backdrop-blur sm:hidden"
    >
      <ul className="mx-auto flex w-full max-w-3xl items-stretch justify-between">
        {ITENS.map(({ rota, rotulo, Icone }) => {
          const ativo = pathname.startsWith(rota)
          return (
            <li key={rota} className="flex-1">
              <button
                type="button"
                onClick={() => navegar(rota)}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-[60px] w-full flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-bold ${
                  ativo ? "bg-roxo-claro text-roxo-escuro" : "text-roxo-escuro/70 hover:bg-roxo-claro/50"
                }`}
              >
                <Icone size={26} />
                {rotulo}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
