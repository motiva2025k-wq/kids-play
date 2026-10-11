// Moldura das telas de login/cadastro (usuário ainda não entrou).
export default function AuthLayout({ titulo, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <div className="text-4xl font-bold">
          <span className="text-dourado">Kids</span>
          <span className="text-roxo">_Play</span>
        </div>
        <p className="mt-1 font-semibold text-roxo-escuro/70">
          Reforço escolar divertido, com calma e sem pressa
        </p>
      </div>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_6px_0_0_var(--color-roxo-claro)]">
        <h1 className="mb-4 text-2xl font-bold">{titulo}</h1>
        {children}
      </div>
    </div>
  )
}
