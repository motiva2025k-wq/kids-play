// Cenário do mundo — camada decorativa fixa atrás do conteúdo.
// 100% CSS (leve, sem imagens), aria-hidden e pointer-events-none.
// Animações respeitam prefers-reduced-motion e o botão "Reduzir animações".
export default function Cenario() {
  return (
    <div className="cenario" aria-hidden="true">
      <div className="nuvem nuvem-a" />
      <div className="nuvem nuvem-b" />
      <div className="nuvem nuvem-c" />
      <div className="moeda-flutuante moeda-a">★</div>
      <div className="moeda-flutuante moeda-b">★</div>
      <div className="moeda-flutuante moeda-c">★</div>
      <div className="grama-blocos" />
    </div>
  )
}
