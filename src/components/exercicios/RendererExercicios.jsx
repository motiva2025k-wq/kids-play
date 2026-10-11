// Renderer de exercícios (FASE 3).
// Escolhe o componente certo pelo `tipo` da pergunta e expõe a interface comum:
//
//   <Renderer
//     pergunta={...}
//     onResponder=(correta, detalhes) => void
//     disabled
//     lerEmVozAlta={() => void}
//     labelAcentuacao?  // botão "ouvir"
//   />
//
import { useMemo } from 'react'
import TipoMultiplaEscolha from './TipoMultiplaEscolha.jsx'
import TipoVerdadeiroFalso from './TipoVerdadeiroFalso.jsx'
import TipoCompletar from './TipoCompletar.jsx'
import TipoArrastarSoltar from './TipoArrastarSol tar.jsx'
import TipoContarImagens from './TipoContarImagens.jsx'

// tipos suportados
const TIPOS = [
  'multipla_escolha',
  'verdadeiro_falso',
  'completar',
  'arrastar_soltar',
  'contar_imagens',
]

export default function RendererExercicios({
  pergunta,
  onResponder,
  disabled = false,
  lerEmVozAlta,
  labelAcentuacao,
  className = '',
}) {
  const Component = useMemo(() => {
    // Fallback seguro: se tipo não é suportado, mostra um card de aviso (nunca quebra)
    if (!pergunta || !pergunta.tipo) return null
    switch (pergunta.tipo) {
      case 'multipla_escolha':
        return TipoMultiplaEscolha
      case 'verdadeiro_falso':
        return TipoVerdadeiroFalso
      case 'completar':
        return TipoCompletar
      case 'arrastar_soltar':
        return TipoArrastarSoltar
      case 'contar_imagens':
        return TipoContarImagens
      default:
        // tipo desconhecido: renderiza nada, mas loga cautelosamente
        console.warn('[renderer] tipo de exercício não suportado:', pergunta.tipo)
        return null
    }
  }, [pergunta?.tipo])

  if (!Component) {
    // Placeholder leve para tipos não implementados ou dados vazios.
    return (
      <div className={`bloco p-6 text-center text-alerta font-semibold ${className}`}>
        Exercício indisponível no momento.
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Component
        pergunta={pergunta}
        onResponder={onResponder}
        disabled={disabled}
        lerEmVozAlta={lerEmVozAlta}
        labelAcentuacao={labelAcentuacao}
      />
    </div>
  )
}
