// Moldura das telas de login/cadastro (usuário ainda não entrou).
// Mostra o ícone quadrado (K com coroa) e o logo horizontal acima do form.
export default function AuthLayout({ titulo, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        {/* Ícone quadrado 112px */}
        <img
          src="/assets/logo/kidsplay-icone.svg"
          alt="Kids_Play"
          width={112}
          height={112}
          loading="eager"
          className="mx-auto mb-3 h-28 w-28"
        />
        {/* Logo horizontal — máx. 80% da tela */}
        <img
          src="/assets/logo/kidsplay-logo.svg"
          alt="Kids_Play"
          width={260}
          height={90}
          loading="eager"
          className="mx-auto mb-2 w-[min(260px,80vw)] h-auto"
        />
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
