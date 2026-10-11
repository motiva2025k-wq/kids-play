import { useEffect } from "react"

export default function Modal({ aberto = false, titulo = "", onFechar, children, className = "" }) {
  useEffect(() => {
    if (!aberto) return
    const onKey = (e) => {
      if (e.key === "Escape") onFechar?.()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true">
      <div className={`bloco max-w-lg w-full bg-white ${className}`}>
        <div className="flex items-center justify-between border-b-4 border-roxo-escuro px-4 py-3">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button type="button" onClick={onFechar} className="btn-afunda bloco px-3 py-1 text-base font-bold" aria-label="Fechar modal">✕</button>
        </div>
        <div className="px-4 py-4">{children}</div>
      </div>
    </div>
  )
}
