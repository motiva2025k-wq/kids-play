// Moldura das telas logadas: cabeçalho com marca + conteúdo centralizado.
// Tema de jogo: cenário fixo atrás do conteúdo (céu, nuvens, moedas, grama)
// e botão ⚙️ com as preferências de bem-estar (animações/sons).
import Cenario from "./ui/Cenario.jsx"
import MenuInferior from "./ui/MenuInferior.jsx"
import Preferencias from "./ui/Preferencias.jsx"

export default function Layout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Cenario />
      <header className="border-b-4 border-roxo-escuro bg-roxo">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <span className="text-2xl font-bold drop-shadow-[3px_3px_0_var(--color-roxo-escuro)]">
            <span className="text-dourado">Kids</span>
            <span className="text-white">_Play</span>
          </span>
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
