// Balão de fala do Kapivarus. lado='esquerda' quando ele está
// à esquerda do texto; 'direita' quando está à direita.
export default function BalaoFala({ children, lado = 'esquerda' }) {
  const esquerda = lado === 'esquerda'

  return (
    <div className="relative rounded-3xl bg-white p-4 shadow-[0_6px_0_0_var(--color-roxo-claro)]">
      <span
        aria-hidden="true"
        className={`absolute top-8 h-0 w-0 border-y-8 border-y-transparent ${
          esquerda
            ? '-left-3 border-r-[16px] border-r-white'
            : '-right-3 border-l-[16px] border-l-white'
        }`}
      />
      <p className="text-lg font-semibold leading-snug">{children}</p>
    </div>
  )
}
