export default function Card({ children, className = "", title, footer }) {
  return (
    <div className={`bloco bg-white ${className}`}>
      {title && <div className="border-b-4 border-roxo-escuro px-4 py-3 text-xl font-bold">{title}</div>}
      <div className="px-4 py-4">{children}</div>
      {footer && <div className="border-t-4 border-roxo-claro px-4 py-3">{footer}</div>}
    </div>
  )
}
