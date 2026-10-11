// Moldura das telas logadas: cabeçalho com marca + conteúdo centralizado.
// Tema de jogo: cenário fixo atrás do conteúdo (céu, nuvens, moedas, grama)
// e botão ⚙️ com as preferências de bem-estar (animações/sons).
// O "Kids_Play" do cabeçalho é o logo oficial (versão fundo-roxo, que é a
// mais legível sobre o roxo do header). Ele é um link para /home.
import { Link } from "react-router-dom"
import Cenario from "./ui/Cenario.jsx"
import MenuInferior from "./ui/MenuInferior.jsx"
import Preferencias from "./ui/Preferencias.jsx"

export default function Layout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Cenario />
      <header className="border-b-4 border-roxo-escuro bg-roxo">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          {/* Logo oficial — link para a tela inicial */}
          <Link to="/home" aria-label="Kids_Play — ir para o início" className="inline-flex items-center">
            <img
              src="/assets/logo/kidsplay-logo-fundo-roxo.svg"
              alt="Kids_Play"
              width={138}
              height={48}
              loading="eager"
              className="h-9 w-auto sm:h-12"
            />
          </Link>
          <div className="flex items-center gap-2">
            <span className="bloco-suave px-3 py-1 text-sm font-semibold text-roxo-escuro">
              2º · 3º · 4º ano
            </span>
            {/* Configurações de bem-estar (reduzir animações / silenciar sons) */}
            <details className="relative">
              <summary
                className="btn-afunda bloco inline-flex min-h-[40px] min-w-[40px] list-none items-center justify-center rounded-xl px-3 py-1 text-lg font-bold select-none"
                aria-label="Configurações de acessibilidade"
              >
                ⚙️
              </summary>
              <div className="absolute right-0 z-40 mt-2 w-72">
                <Preferencias className="bloco bg-white p-3" />
              </div>
            </details>
          </div>
        </div>
      </header>
      {/* Espaço para o menu inferior fixo (mobile) não cobrir o conteúdo */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 sm:pb-6">{children}</main>
      <MenuInferior />
    </div>
  )
}
