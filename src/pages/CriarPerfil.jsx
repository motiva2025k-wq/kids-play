import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Botao from '../components/ui/Botao.jsx'
import Campo from '../components/ui/Campo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { AVATARES } from '../data/avatares.js'
import { repo } from '../lib/repo/index.js'

const ANOS = [
  { valor: '2', texto: '2º ano' },
  { valor: '3', texto: '3º ano' },
  { valor: '4', texto: '4º ano' },
]

export default function CriarPerfil() {
  const { usuario } = useAuth()
  const navegar = useNavigate()

  const [nickname, setNickname] = useState('')
  const [schoolYear, setSchoolYear] = useState('2')
  const [avatarId, setAvatarId] = useState(AVATARES[0].id)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')

    const apelido = nickname.trim()
    if (apelido.length < 2 || apelido.length > 20) {
      setErro('O apelido precisa ter de 2 a 20 letras.')
      return
    }

    setSalvando(true)
    try {
      // `usuario.id` é o id do responsável online e 'local' no modo local:
      // uma única chamada atende os dois modos.
      await repo.criarPerfil({
        guardian_id: usuario?.id,
        nickname: apelido,
        school_year: schoolYear,
        avatar_id: avatarId,
      })
    } catch (erroSalvar) {
      console.error(erroSalvar)
      setErro('Não deu para salvar o perfil. Tente de novo.')
      setSalvando(false)
      return
    }
    setSalvando(false)
    navegar('/perfis')
  }

  return (
    <Layout>
      <h1 className="mb-1 text-2xl font-bold">Criar perfil da criança</h1>
      <p className="mb-6 opacity-80">
        Use um <strong>apelido</strong> (nunca o nome completo) — é o que aparece
        no ranking.
      </p>

      <form onSubmit={aoEnviar} className="space-y-6">
        <Campo
          id="apelido"
          label="Apelido da criança"
          maxLength={20}
          placeholder="Ex.: Bia, Gui, Dudu…"
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <fieldset>
          <legend className="mb-2 font-semibold">Ano escolar</legend>
          <div className="grid grid-cols-3 gap-3">
            {ANOS.map((ano) => (
              <button
                key={ano.valor}
                type="button"
                onClick={() => setSchoolYear(ano.valor)}
                className={`min-h-13 rounded-2xl border-2 text-lg font-bold ${
                  schoolYear === ano.valor
                    ? 'border-roxo bg-roxo text-white'
                    : 'border-roxo-claro bg-white text-roxo-escuro'
                }`}
              >
                {ano.texto}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold">Escolha o personagem</legend>
          <div className="grid grid-cols-3 gap-3">
            {AVATARES.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setAvatarId(avatar.id)}
                aria-pressed={avatarId === avatar.id}
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 ${
                  avatarId === avatar.id
                    ? 'border-roxo bg-roxo-claro'
                    : 'border-roxo-claro bg-white'
                }`}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white"
                  style={{ backgroundColor: avatar.cor }}
                >
                  {avatar.nome[0]}
                </span>
                <span className="text-sm font-semibold">{avatar.nome}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {erro ? (
          <p role="alert" className="rounded-2xl bg-roxo-claro p-3 font-semibold text-alerta">
            {erro}
          </p>
        ) : null}

        <Botao type="submit" variante="verde" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar perfil'}
        </Botao>
      </form>
    </Layout>
  )
}
