import Avatar from "./Avatar.jsx"

export default function Trono({
  avatarId,
  fotoUrl,
  apelido = "",
  posicao = 1, // 1, 2 ou 3
  tamanho = 96,
  className = "",
}) {
  const p = posicao === 2 ? 2 : posicao === 3 ? 3 : 1
  const titulo = p === 1 ? "1º lugar" : p === 2 ? "2º lugar" : "3º lugar"

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg
        width={tamanho}
        height={tamanho}
        viewBox="0 0 32 32"
        role="img"
        aria-label={`Trono — ${titulo}`}
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        {p === 1 && (
          <g>
            {/* Base dourada forte */}
            <rect x="4" y="22" width="24" height="4" fill="#f5b301" />
            <rect x="5" y="20" width="22" height="2" fill="#f59e0b" />
            {/* Encosto alto */}
            <rect x="6" y="10" width="20" height="10" fill="#f5b301" />
            <rect x="7" y="11" width="18" height="8" fill="#fbbf24" />
            {/* Detalhes joias */}
            <rect x="9" y="13" width="2" height="2" fill="#38bdf8" />
            <rect x="21" y="13" width="2" height="2" fill="#38bdf8" />
            <rect x="15" y="12" width="2" height="2" fill="#4caf50" />
            {/* Braços */}
            <rect x="4" y="16" width="2" height="6" fill="#f59e0b" />
            <rect x="26" y="16" width="2" height="6" fill="#f59e0b" />
            {/* Degraus */}
            <rect x="6" y="26" width="20" height="2" fill="#7a5600" />
          </g>
        )}

        {p === 2 && (
          <g>
            {/* Base prata/dourada média */}
            <rect x="6" y="22" width="20" height="4" fill="#f5b301" />
            <rect x="7" y="20" width="18" height="2" fill="#f59e0b" />
            {/* Encosto médio */}
            <rect x="8" y="12" width="16" height="8" fill="#f5b301" />
            <rect x="9" y="13" width="14" height="6" fill="#fbbf24" />
            {/* Detalhes */}
            <rect x="10" y="14" width="2" height="2" fill="#38bdf8" />
            <rect x="20" y="14" width="2" height="2" fill="#38bdf8" />
            {/* Braços */}
            <rect x="6" y="17" width="2" height="5" fill="#f59e0b" />
            <rect x="24" y="17" width="2" height="5" fill="#f59e0b" />
            {/* Degraus */}
            <rect x="8" y="26" width="16" height="2" fill="#7a5600" />
          </g>
        )}

        {p === 3 && (
          <g>
            {/* Base mais suave */}
            <rect x="8" y="22" width="16" height="4" fill="#f5b301" />
            <rect x="9" y="20" width="14" height="2" fill="#f59e0b" />
            {/* Encosto menor */}
            <rect x="10" y="14" width="12" height="6" fill="#f5b301" />
            <rect x="11" y="15" width="10" height="4" fill="#fbbf24" />
            {/* Braços */}
            <rect x="8" y="18" width="2" height="4" fill="#f59e0b" />
            <rect x="22" y="18" width="2" height="4" fill="#f59e0b" />
            {/* Degraus */}
            <rect x="10" y="26" width="12" height="2" fill="#7a5600" />
          </g>
        )}

        {/* Lugar da criança sentada (centro) */}
        <foreignObject x="10" y="8" width="12" height="12">
          <div className="flex h-full w-full items-center justify-center">
            <Avatar avatarId={avatarId} fotoUrl={fotoUrl} tamanho={32} />
          </div>
        </foreignObject>
      </svg>
      {apelido && <span className="text-sm font-bold">{apelido}</span>}
      <span className="rounded-full bg-dourado-claro px-2 py-0.5 text-xs font-bold border-2 border-dourado-escuro">
        {titulo}
      </span>
    </div>
  )
}
