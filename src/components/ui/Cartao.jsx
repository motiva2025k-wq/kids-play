// Cartão branco com cantos grandes — o "bloco" base do visual do app.
export default function Cartao({ children, className = '' }) {
  return (
    <div
      className={`rounded-3xl bg-white p-6 shadow-[0_6px_0_0_var(--color-roxo-claro)] ${className}`}
    >
      {children}
    </div>
  )
}
