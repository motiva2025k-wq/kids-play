// KapivarusFala — atalho de compatibilidade: já que o componente Kapivarus
// agora aceita `mensagem`, este wrapper mantém a API antiga das telas
// (pose, texto, tom, size) funcionando sem alterações.
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
  return (
    <Kapivarus
      estado={pose}
      mensagem={texto}
      tom={tom}
      tamanho={size}
      mostrarBotaoEntendi={mostrarBotaoEntendi}
      onEntendi={onEntendi}
      ariaLabel={`Kapivarus falando — ${tom}`}
      className={className}
    />
  )
}
