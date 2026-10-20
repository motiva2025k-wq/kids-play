// Aviso reutilizável para funcionalidades que exigem conexão.
export default function AvisoModoLocal({ titulo, texto, dica }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_6px_0_0_var(--color-roxo-claro)]">
      <h2 className="mb-2 text-xl font-bold text-roxo">{titulo}</h2>
      <p className="mb-3">{texto}</p>
      {dica && <p className="mt-4 text-sm opacity-70">{dica}</p>}
    </div>
  )
}
