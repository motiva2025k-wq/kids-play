export default function Badge({ tipo = "xp", valor = 0, className = "" }) {
  const config = {
    xp: { bg: "bg-dourado-claro", border: "border-dourado-escuro", texto: "text-dourado-escuro", rotulo: "XP" },
    moedas: { bg: "bg-verde-claro", border: "border-verde-escuro", texto: "text-verde-escuro", rotulo: "Moedas" },
    nivel: { bg: "bg-roxo-claro", border: "border-roxo-escuro", texto: "text-roxo-escuro", rotulo: "Nível" },
    streak: { bg: "bg-ceu-claro", border: "border-ceu-escuro", texto: "text-ceu-escuro", rotulo: "Streak" },
  }
  const c = config[tipo] || config.xp
  return (
    <span className={`bloco inline-flex items-center gap-2 px-3 py-1 text-sm font-bold ${c.bg} ${c.border} ${c.texto} ${className}`}>
      <span>{c.rotulo}</span>
      <span className="rounded-full bg-white/70 px-2 py-0.5">{valor}</span>
    </span>
  )
}
