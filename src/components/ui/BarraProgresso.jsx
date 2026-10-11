// Barra de progresso — sempre visível nas missões (regra do projeto).
// valor: 0 a 1. rotulo: texto curto explicando o que está sendo medido.
// Estilo: barra de vida de jogo (borda grossa + gradiente + brilho),
// tema em theme.css (.barra-meta-trilho / .barra-meta-preenchimento).
export default function BarraProgresso({ valor = 0, rotulo }) {
  const porcentagem = Math.min(100, Math.max(0, Math.round(valor * 100)))

  return (
    <div>
      {rotulo ? (
        <div className="mb-1 flex justify-between text-sm font-semibold">
          <span>{rotulo}</span>
          <span>{porcentagem}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={porcentagem}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={rotulo ?? "Progresso"}
        className="barra-meta-trilho h-6 w-full overflow-hidden rounded-full"
      >
        <div
          className="barra-meta-preenchimento h-full rounded-full transition-[width] duration-300"
          style={{ width: `${porcentagem}%` }}
        />
      </div>
    </div>
  )
}
