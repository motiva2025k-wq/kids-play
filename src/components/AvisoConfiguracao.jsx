// Aviso mostrado quando o app ainda não foi conectado ao Supabase.
export default function AvisoConfiguracao() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-lg rounded-3xl bg-white p-6 shadow-[0_6px_0_0_var(--color-roxo-claro)]">
        <h1 className="mb-3 text-2xl font-bold text-roxo">
          Falta conectar o banco de dados
        </h1>
        <p className="mb-4">
          Este app ainda não recebeu as chaves do Supabase. É simples:
        </p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Copie o arquivo <code>.env.example</code> e renomeie a cópia para <code>.env.local</code></li>
          <li>Abra o Supabase → <strong>Project Settings → API</strong></li>
          <li>Cole a <strong>Project URL</strong> e a <strong>anon key</strong> no <code>.env.local</code></li>
          <li>Desenvolva de novo: <code>npm run dev</code></li>
        </ol>
        <p className="mt-4 text-sm opacity-70">
          O passo a passo completo está no arquivo README.md do projeto.
        </p>
      </div>
    </div>
  )
}
