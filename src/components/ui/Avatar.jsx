import { avatarPorId } from "../../data/avatares"

export default function Avatar({ avatarId, fotoUrl, tamanho = 64, moldura = false, className = "" }) {
  const av = avatarId ? avatarPorId(avatarId) : null
  const bg = av?.cor || "#6d28d9"
  const iniciais = av?.iniciais || "K"
  const estilo = { width: tamanho, height: tamanho, fontSize: tamanho * 0.4 }
  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${moldura ? "bloco p-1" : ""} ${className}`} style={estilo}>
      {fotoUrl ? (
        <img src={fotoUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full text-white font-bold" style={{ backgroundColor: bg }}>
          {iniciais}
        </div>
      )}
    </div>
  )
}
