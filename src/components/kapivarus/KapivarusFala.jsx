import Kapivarus from "./Kapivarus.jsx"

export default function KapivarusFala({
  pose = "neutro",
  texto = "",
  tom = "dica",
  mostrarBotaoEntendi = false,
  onEntendi,
  size = 72,
  className = "",
}) {
  const tomClasses = {
    dica: "border-roxo-escuro bg-roxo-claro text-roxo-escuro",
    acerto: "border-verde-escuro bg-verde-claro text-verde-escuro",
    incentivo: "border-dourado-escuro bg-dourado-claro text-roxo-escuro",
  }

  const classes = tomClasses[tom] || tomClasses.dica

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Kapivarus pose={pose} size={size} ariaLabel={`Kapivarus falando — ${tom}`} />
      <div className={`bloco relative max-w-md px-4 py-3 ${classes}`}>
        {/* "Rabicho" do balão */}
        <span className="absolute -left-3 top-6 block h-0 w-0 border-y-[10px] border-r-[12px] border-y-transparent border-r-current opacity-70" />
        <p className="text-lg font-semibold leading-snug">{texto}</p>
        {mostrarBotaoEntendi && (
          <button
            type="button"
            onClick={onEntendi}
            className="btn-afunda bloco mt-3 px-4 py-2 text-base font-bold hover:bg-white"
          >
            Entendi
          </button>
        )}
      </div>
    </div>
  )
}
