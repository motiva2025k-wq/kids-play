// Medidor de HUD de jogo — usado para XP, Moedas, Nível e Dias seguidos.
// icone: elemento JSX (ver Icones.jsx). animar: classe de animação opcional
// (ex.: "estrela-pulsar", "moeda-girar", "chama-balancar").
export default function HudItem({ icone, rotulo, valor, cor = "dourado", animar = "", className = "" }) {
  const cores = {
    dourado: "bg-dourado-claro border-dourado-escuro text-dourado-escuro",
    verde: "bg-verde-claro border-verde-escuro text-verde-escuro",
    azul: "bg-ceu-claro border-ceu-escuro text-ceu-escuro",
    roxo: "bg-roxo-claro border-roxo-escuro text-roxo-escuro",
    laranja: "bg-laranja-claro border-laranja-escuro text-laranja-escuro",
    rosa: "bg-rosa-claro border-rosa-escuro text-rosa-escuro",
  }

  return (
    <div className={`bloco hud-item flex flex-col items-center gap-1 px-2 py-3 text-center ${cores[cor] || cores.dourado} ${className}`}>
      <span className={`hud-icone ${animar}`}>{icone}</span>
      <span className="text-xs font-semibold leading-tight opacity-80">{rotulo}</span>
      <span className="text-2xl font-bold leading-none">{valor}</span>
    </div>
  )
}
