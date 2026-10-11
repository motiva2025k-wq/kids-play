// Confete de comemoração — CSS puro (leve, sem imagens).
// Renderiza N lascas coloridas caindo. Decorativo (aria-hidden) e
// desligado automaticamente com prefers-reduced-motion ou
// "Reduzir animações".
const CORES = ["#f5b301", "#ec4899", "#38bdf8", "#4caf50", "#f97316", "#7c3aed"]

export default function Confete({ quantidade = 14, className = "" }) {
  return (
    <div className={`confete ${className}`} aria-hidden="true">
      {Array.from({ length: quantidade }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 100) / quantidade + 2}%`,
            background: CORES[i % CORES.length],
            animationDuration: `${2.6 + (i % 5) * 0.6}s`,
            animationDelay: `${(i % 7) * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}
