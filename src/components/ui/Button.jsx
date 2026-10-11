export default function Button({
  children,
  variant = "primario",
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const base = "btn-afunda min-h-[48px] min-w-[48px] rounded-xl px-5 py-3 text-lg font-bold border-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-dourado"
  const variants = {
    primario: "border-roxo-escuro bg-roxo text-white hover:bg-roxo-escuro",
    secundario: "border-roxo-escuro bg-white text-roxo-escuro hover:bg-roxo-claro",
    "perigo-suave": "border-vermelho-escuro-suave bg-vermelho-claro-suave text-vermelho-escuro-suave hover:bg-white",
    desabilitado: "border-neutro-700 bg-neutro-200 text-neutro-700 opacity-60 cursor-not-allowed",
  }
  const cls = disabled ? variants.desabilitado : (variants[variant] || variants.primario)
  return (
    <button type={type} disabled={disabled} className={`${base} ${cls} ${className}`} {...props}>
      {children}
    </button>
  )
}
