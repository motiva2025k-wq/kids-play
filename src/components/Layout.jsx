// Moldura das telas logadas: cabeçalho com marca + conteúdo centralizado.
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-roxo">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <span className="text-2xl font-bold">
            <span className="text-dourado">Kids</span>
            <span className="text-white">_Play</span>
          </span>
          <span className="rounded-full bg-roxo-claro px-3 py-1 text-sm font-semibold text-roxo-escuro">
            2º · 3º · 4º ano
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
