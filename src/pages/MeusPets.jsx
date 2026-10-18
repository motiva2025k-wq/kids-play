// Meus Pets — tela de gerenciamento de pets (Etapa 3).
// Cada criança pode manter pet(s); apenas um de cada vez na tela inicial.
// Persistência: localStorage com chave por criança. Modelo pensa em
// persistência via Supabase futura (tabela pets).

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { IconePets, IconePergaminho, IconeCoroa, IconeEstrela, IconeBau } from '../components/ui/Icones.jsx'
import { lerPerfilSelecionado } from '../lib/perfil.js'
import { lerCatalogoPets, especiesDisponiveisPets, buscarEspeciePets, svgDeEspecie } from '../lib/petsJson.js'

export const PET_SPECIES = especiesDisponiveisPets()

/** Consulta a espécie de um pet, lendo o catálogo JSON. */
function especieDoPet(catálogo, pet) {
  if (!pet) return null
  return buscarEspeciePets(catálogo, pet.especie_id)
}

const catalogoPets = lerCatalogoPets()

/** Acessórios do pet, citados do catálogo. */
export function acessoriosDoPet(petId, catalogo) {
  const especie = buscarEspeciePets(catalogo, petId)
  return especie?.acessorios || null
}

function lerPets() {
  try {
    const raw = localStorage.getItem('kids_play_pets_v1')
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed[perfil?.id] ?? {}
  } catch {
    return {}
  }
}

function guardarPets(petsAoSalvar) {
  try {
    const dados = { ...pets, [perfil?.id]: petsAoSalvar }
    localStorage.setItem('kids_play_pets_v1', JSON.stringify(dados))
    setPets(dados[perfil?.id] ?? {})
  } catch {
    // Storage insuficiente ou bloqueado: manter o jogo em pé.
  }
}

export default function MeusPets() {
  const navegar = useNavigate()
  const perfil = lerPerfilSelecionado()
  const [pets, setPets] = useState({})
  const [escolhido, setEscolhido] = useState(null)

  useEffect(() => {
    if (!perfil?.id) return
    setPets(lerPets())
  }, [perfil?.id])

  function selecionarPet(petId) {
    setEscolhido(petId)
  }

  function removerPet(petId) {
    if (!window.confirm('Remover este pet? Ele não voltará.')) return
    const pets = lerPets()
    delete pets[petId]
    guardarPets(pets)
  }

  const petAtual = pets[escolhido]
  const especieAtual = especieDoPet(catalogoPets, petAtual)

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navegar(-1)}>
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold">Meus Pets</h1>
        <div className="w-20" />
      </div>

      <p className="mb-4 text-sm opacity-80">
        O pet de companhia cresce com o estudo. Ele não pode ser perdido:
        dias sem entrar ficam feliz e dormem — sem culpa.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {PET_SPECIES.map((especie) => {
          const id = especie.id
          const jaTem = !!pets[id]
          const pet = pets[id]
          const estagio = STAGIOS.find((s) => s.key === pet?.estagio) ?? STAGIOS[0]
          const especieMais = especieDoPet(catalogoPets, pet)
          return (
            <Card
              key={id}
              className={`p-4 cursor-pointer transition ${
                petAtual?.especie_id === id
                  ? 'borda verde-escuro'
                  : 'borda roxo-claro'
              }`}
              onClick={() => selecionarPet(id)}
            >
              <div className="flex items-center gap-3">
                <div className="bloco-avatar">
                  {svgDeEspecie(especieMais, pet?.estagio ?? 'filhote', pet?.cor ?? especie.corPadrao)}
                </div>
                <div>
                  <p className="font-bold">{especie.nome}</p>
                  <p className="text-xs opacity-70">
                    {pet?.nome ?? 'Cauê / cai só com o nome'}
                  </p>
                  <p className="text-xs font-semibold">
                    {estagio.label} · XP {pet?.xp ?? 0}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-rosa-200">
                  <div
                    className="h-full rounded-full bg-verde transition-[width] duration-300"
                    style={{ width: `${pet?.energia ?? 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs opacity-70">
                  Energia {pet?.energia ?? 100}%
                </p>
              </div>
              <div className="mt-2 flex gap-2">
                {pet?.acessorio_id && especieAtual && (
                  <span className="badge-adj acessorio">
                    {pet.acessorio_id ? especieAtual.acessorios?.[pet.acessorio_id] ?? pet.acessorio_id : ''}
                  </span>
                )}
                {jaTem && (
                  <Button
                    variant="secundarioPequeno"
                    className="mt-1 w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      removerPet(id)
                    }}
                  >
                    <IconeCoroa />
                    Remover
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {!petAtual && (
        <Card className="mt-3 p-4 opacity-80">
          <p className="font-bold">Você ainda não tem pet de companhia.</p>
          <p className="mt-1 text-sm opacity-80">
            Ele aparece na primeira missão da trilha. Depois, garante a volta.
          </p>
        </Card>
      )}

      {petAtual && (
        <div className="mt-4 flex gap-2">
          <Button
            className="btn-jogo flex-1"
            onClick={() => navegar('/meus-pets')}
          >
            <IconePets />
            Meu pet
          </Button>
          <Button
            className="btn-jogo"
            onClick={() => navegar(`/pet/${petAtual.especie_id ?? PET_SPECIES[0].id}`)}
          >
            <IconePergaminho />
            Perfil do pet
          </Button>
        </div>
      )}
    </Layout>
  )
}
