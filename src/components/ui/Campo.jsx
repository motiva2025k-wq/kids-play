// Campo de formulário com rótulo e mensagem de erro em português.
export default function Campo({ label, erro, id, ...props }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block font-semibold">{label}</span>
      <input
        id={id}
        className={`w-full rounded-2xl border-2 bg-white px-4 py-3 text-lg text-roxo-escuro placeholder:text-roxo/40 ${
          erro ? 'border-alerta' : 'border-roxo-claro'
        }`}
        {...props}
      />
      {erro ? <span className="mt-1 block text-sm text-alerta">{erro}</span> : null}
    </label>
  )
}
