// Botão grande, com alvo fácil de tocar (acessibilidade).
// variantes: 'roxo' (principal), 'dourado', 'verde', 'fantasma'
export default function Botao({
  variante = 'roxo',
  className = '',
  type = 'button',
  ...props
}) {
  const variantes = {
    roxo: 'bg-roxo text-white hover:bg-roxo-escuro',
    dourado: 'bg-dourado text-roxo-escuro hover:bg-dourado/85',
    verde: 'bg-verde-escuro text-white hover:bg-verde',
    fantasma: 'bg-white text-roxo border-2 border-roxo-claro hover:bg-roxo-claro',
  }

  return (
    <button
      type={type}
      className={`min-h-13 w-full rounded-2xl px-6 py-3 text-lg font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantes[variante]} ${className}`}
      {...props}
    />
  )
}
