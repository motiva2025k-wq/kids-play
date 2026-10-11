import { AVATARES_ORIGINAIS } from "../../data/avataresOriginais.jsx"

export default function CatalogoAvatares({
  selecionado = null,
  onSelecionar = () => {},
  className = "",
}) {
  return (
    <div className={`grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 ${className}`}>
      {AVATARES_ORIGINAIS.map((av) => {
        const ativo = selecionado === av.id
        return (
          <button
            key={av.id}
            type="button"
            onClick={() => onSelecionar(av.id)}
            className={`btn-afunda bloco min-h-[48px] min-w-[48px] flex flex-col items-center gap-1 p-2 ${
              ativo ? "ring-4 ring-dourado" : ""
            }`}
            aria-pressed={ativo}
          >
            <div className="flex h-12 w-12 items-center justify-center">{av.svg(32)}</div>
            <span className="text-xs font-bold">{av.nome}</span>
          </button>
        )
      })}
    </div>
  )
}
