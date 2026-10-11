export default function ProgressBar({ atual = 0, total = 1, className = "", rotulo }) {
  const pct = Math.max(0, Math.min(100, total <= 0 ? 0 : (atual / total) * 100))
  return (
    <div className={`w-full ${className}`} aria-label={rotulo || "Progresso da missão"}>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold">
        <span>{rotulo}</span>
        <span>{atual}/{total}</span>
      </div>
      <div className="bloco h-6 w-full overflow-hidden bg-roxo-claro">
        <div className="h-full bg-verde transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
