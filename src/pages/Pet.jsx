// Pet — tela de um pet individual (Etapa 3).
// Mostra estado atual (energia/estágio/nome), o visual SVG e ações leves
// sem resolver questões: toque, petisco (loja), acessório, nome,
// e notificação de "volta após dias" sem punição.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { IconePergaminho, IconeMoeda } from '../components/ui/Icones.jsx'
import { lerPerfilSelecionado } from '../lib/perfil.js'
import { lerCatalogoPets, especiesDisponiveisPets, buscarEspeciePets, svgDeEspecie } from '../lib/petsJson.js'

export const PET_SPECIES = especiesDisponiveisPets()

const catalogoPets = lerCatalogoPets()

/** Devolve a espécie de um pet pelo catálogo. */
function especieDoPet(petId) {
  return buscarEspeciePets(catalogoPets, petId)
}

const STAGIOS = [
  { key: 'filhote', label: 'Filhote', xp: 0, cor: '#FCD34D' },
  { key: 'jovem', label: 'Jovem', xp: 25, cor: '#F59E0B' },
  { key: 'adulto', label: 'Adulto', xp: 60, cor: '#F97316' },
]

const ESTADOS_PET = [
  { key: 'feliz', label: 'Feliz', cor: '#4CAF50', estadoEvocador: true },
  { key: 'cansado', label: 'Cansado', cor: '#F59E0B', estadoEvocador: false },
  { key: 'dormindo', label: 'Dormindo', cor: '#94A3B8', estadoEvocador: false },
]

function lerPets() {
  try {
    const raw = localStorage.getItem('kids_play_pets_v1')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function guardarPets(pets) {
  localStorage.setItem('kids_play_pets_v1', JSON.stringify(pets))
}

export default function Pet({ childId, especieId, petId }) {
  const navegar = useNavigate()
  const perfil = lerPerfilSelecionado()
  const [pet, setPet] = useState(() => null)

  useEffect(() => {
    if (!childId) return
    const pets = lerPets()
    const chave = `${childId}:${petId ?? especieId}`
    const salvo = pets[chave]
    if (salvo) setPet(salvo)
  }, [childId, especieId, petId])

  function alimentarPet() {
    if (!childId) return
    const pets = lerPets()
    const chave = `${childId}:${petId ?? especieId}`
    const p = pets[chave]
    if (!p) return
    const atual = { ...p }
    atual.energia = Math.min(100, atual.energia + 15)
    atual.xp += 3
    petAtualizar(atual)
  }

  function tocarPet() {
    if (!childId) return
    const pets = lerPets()
    const chave = `${childId}:${petId ?? especieId}`
    const p = pets[chave]
    if (!p) return
    const atual = { ...p }
    atual.energia = Math.min(100, atual.energia + 5)
    petAtualizar(atual)
  }

  function petAtualizar(atual) {
    const pets = lerPets()
    const chave = `${childId}:${petId ?? especieId}`
    pets[chave] = atual
    setPet({ ...atual })
    guardarPets(pets)
  }

  const especie = especieDoPet(pet?.especie_id)
  const estagioAtual = STAGIOS.find((s) => s.key === pet?.estagio) ?? STAGIOS[0]
  const estadoAtual = ESTADOS_PET.find((s) => s.key === (pet?.estado ?? 'feliz')) ?? ESTADOS_PET[0]

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navegar(-1)}>
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold">Pet: {pet?.nome ?? 'Nomeado'}</h1>
        <div className="w-20" />
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bloco p-4 text-center">
            <div className="mb-3">
              {svgDeEspecie(especie, pet?.estagio ?? 'filhote', pet?.cor ?? especie?.corPadrao)}
            </div>
            <h2 className="text-lg font-bold">{pet?.nome}</h2>
            <p className="text-sm opacity-70">{estagioAtual.label}</p>
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-roxo-claro">
                <div
                  className="h-full rounded-full bg-verde transition-[width] duration-300"
                  style={{ width: `${pet?.energia ?? 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs opacity-70">{pet?.energia ?? 100}% de energia</p>
            </div>
            <div className="mt-3 text-sm font-semibold">
              XP do pet: {pet?.xp ?? 0}
            </div>
          </div>

          <div className="bloco p-4">
            <h3 className="mb-2 text-lg font-bold">O que ele está sentindo</h3>
            <p className={`text-lg font-semibold ${pet?.energia ?? 100 >= 60 ? 'text-verde-escuro' : 'text-vermelho-escuro'}`}>
              {estadoAtual.label}
            </p>
            <p className="text-sm opacity-80">
              {pet?.energia ?? 100 >= 60
                ? 'Ele está feliz. Que bom!'
                : 'Ele está cansado. Dá uma pausa e alimenta mais tarde.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button className="btn-jogo" onClick={alimentarPet}>
                🍎 Alimentar (mais energia)
              </Button>
              <Button className="btn-jogo" onClick={tocarPet}>
                👋 Toque (reagir)
              </Button>
              <Button
                className="btn-jogo"
                onClick={() => navegar('/loja')}
              >
                🛍️ Petisco da loja
              </Button>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold">
                Nome do pet
              </label>
              <input
                className="w-full rounded-2xl border-2 border-roxo-claro bg-white px-3 py-2 text-lg"
                placeholder="Ex.: Pipoca"
                value={pet?.nome ?? ''}
                onChange={(e) => {
                  const pets = lerPets()
                  const chave = `${childId}:${petId ?? especieId}`
                  const p = { ...pets[chave] }
                  p.nome = e.target.value
                  pets[chave] = p
                  setPet({ ...p })
                  guardarPets(pets)
                }}
              />
            </div>
          </div>
        </div>

        <div className="bloco p-4 text-center">
          <p className="text-sm opacity-80">
            O pet ganha XP de estudo, não por tempo parado. Ele pode dormir e
            voltar feliz — nunca é punição.
          </p>
        </div>
      </div>
    </Layout>
  )
}
