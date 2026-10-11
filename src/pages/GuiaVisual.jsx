import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Kapivarus, { POSES_KAPIVARUS } from "../components/kapivarus/Kapivarus.jsx"
import KapivarusFala from "../components/kapivarus/KapivarusFala.jsx"
import Button from "../components/ui/Button.jsx"
import Card from "../components/ui/Card.jsx"
import Modal from "../components/ui/Modal.jsx"
import ProgressBar from "../components/ui/ProgressBar.jsx"
import Badge from "../components/ui/Badge.jsx"
import Avatar from "../components/ui/Avatar.jsx"
import Trono from "../components/ui/Trono.jsx"
import CatalogoAvatares from "../components/ui/CatalogoAvatares.jsx"
import Layout from "../components/Layout.jsx"
import { FRASES_ACERTO, FRASES_DICA, FRASES_INCENTIVO } from "../data/frasesKapivarus.js"

export default function GuiaVisual() {
  const navegar = useNavigate()
  const [modalAberto, setModalAberto] = useState(false)
  const [avSel, setAvSel] = useState("kapivara")

  const cores = [
    { nome: "roxo", hex: "#6d28d9" },
    { nome: "roxo-escuro", hex: "#4c1d95" },
    { nome: "dourado", hex: "#f5b301" },
    { nome: "verde", hex: "#4caf50" },
    { nome: "ceu", hex: "#38bdf8" },
    { nome: "vermelho-suave", hex: "#f87171" },
    { nome: "marrom-capivara", hex: "#b98a56" },
  ]

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navegar(-1)}>← Voltar</Button>
        <h1 className="text-2xl font-bold">Guia Visual — Kids_Play</h1>
        <div className="w-[90px]" />
      </div>

      {/* Kapivarus poses */}
      <Card title="Kapivarus — 9 poses (imagens .webp, com fallback SVG)" className="mb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {POSES_KAPIVARUS.map((p) => (
            <div key={p.id} className="bloco flex flex-col items-center gap-2 p-3">
              <Kapivarus pose={p.id} size={80} />
              <div className="text-center">
                <div className="font-bold">{p.nome}</div>
                <div className="text-xs opacity-80">{p.momento}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* KapivarusFala */}
      <Card title="KapivarusFala — balão com tom" className="mb-6">
        <div className="space-y-4">
          <KapivarusFala pose="feliz" tom="dica" texto={FRASES_DICA[0]} mostrarBotaoEntendi onEntendi={() => {}} />
          <KapivarusFala pose="comemorando" tom="acerto" texto={FRASES_ACERTO[0]} />
          <KapivarusFala pose="incentivando" tom="incentivo" texto={FRASES_INCENTIVO[0]} />
        </div>
      </Card>

      {/* Botões */}
      <Card title="Botões — variantes" className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Button>Primário</Button>
          <Button variant="secundario">Secundário</Button>
          <Button variant="perigo-suave">Perigo-suave</Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </Card>

      {/* Bloco e Card */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card title="Card com estilo bloco">
          <p className="text-lg">Bordas grossas, sombra sólida deslocada, cantos levemente arredondados.</p>
        </Card>
        <div className="bloco p-4">
          <h3 className="text-xl font-bold mb-2">Apenas .bloco</h3>
          <p>Utilitário puro para qualquer elemento.</p>
        </div>
      </div>

      {/* ProgressBar + Badges */}
      <Card title="Progresso & Badges" className="mb-6">
        <div className="space-y-4">
          <ProgressBar atual={2} total={5} rotulo="Progresso da missão" />
          <div className="flex flex-wrap gap-2">
            <Badge tipo="xp" valor={150} />
            <Badge tipo="moedas" valor={25} />
            <Badge tipo="nivel" valor={3} />
            <Badge tipo="streak" valor={7} />
          </div>
        </div>
      </Card>

      {/* Modal */}
      <Card title="Modal" className="mb-6">
        <Button onClick={() => setModalAberto(true)}>Abrir modal</Button>
        <Modal aberto={modalAberto} titulo="Exemplo de modal" onFechar={() => setModalAberto(false)}>
          <p className="text-lg">Feche com ESC ou clicando no X.</p>
        </Modal>
      </Card>

      {/* Avatar + Tronos */}
      <Card title="Avatar & Tronos" className="mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar avatarId="gotinha" tamanho={64} moldura />
          <Avatar avatarId="leaozinho" tamanho={80} />
          <Trono avatarId="gotinha" apelido="Ana" posicao={1} tamanho={80} />
          <Trono avatarId="leaozinho" apelido="Bia" posicao={2} tamanho={80} />
          <Trono avatarId="ursinho" apelido="Caio" posicao={3} tamanho={80} />
        </div>
      </Card>

      {/* Catálogo avatares originais */}
      <Card title="Catálogo — 12 avatares originais SVG pixel" className="mb-6">
        <CatalogoAvatares selecionado={avSel} onSelecionar={setAvSel} />
        <p className="mt-3 text-sm opacity-80">Selecionado: {avSel}</p>
      </Card>

      {/* Cores */}
      <Card title="Paleta — cores principais" className="mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cores.map((c) => (
            <div key={c.nome} className="bloco flex flex-col gap-2 p-3">
              <div className="h-12 w-full rounded" style={{ background: c.hex }} />
              <div className="text-sm font-bold">{c.nome}</div>
              <div className="text-xs opacity-80">{c.hex}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tipografia */}
      <Card title="Tipografia — Lexend" className="mb-6">
        <div className="space-y-2">
          <div className="text-3xl font-bold">Lexend Bold — Títulos grandes</div>
          <div className="text-2xl font-semibold">Lexend SemiBold — Subtítulos</div>
          <div className="text-lg">Lexend Regular — Texto corpo (18px base)</div>
          <div className="text-sm opacity-80">Lexend Regular — Texto pequeno</div>
          <p className="mt-2 text-sm opacity-70">Tamanhos generosos pensados pra TDAH. Bom contraste (WCAG AA).</p>
        </div>
      </Card>

      {/* Acessibilidade */}
      <Card title="Acessibilidade & TDAH" className="mb-6">
        <ul className="list-disc pl-5 text-lg space-y-1">
          <li>Botões com área mínima 48px</li>
          <li>Foco visível com outline dourado</li>
          <li>Respeita <code>prefers-reduced-motion</code> (sem animações forçadas)</li>
          <li>No máximo 1 animação por vez na tela</li>
          <li>Texto grande e legível</li>
          <li>Contraste pensado para leitura tranquila</li>
          <li>Mensagens gentis, nunca punitivas</li>
        </ul>
      </Card>

      {/* Exemplos frases */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card title="Dica (15 exemplos)">
          <ul className="space-y-1 text-sm">
            {FRASES_DICA.slice(0, 5).map((f, i) => <li key={i}>“{f}”</li>)}
          </ul>
        </Card>
        <Card title="Acerto (15 exemplos)">
          <ul className="space-y-1 text-sm">
            {FRASES_ACERTO.slice(0, 5).map((f, i) => <li key={i}>“{f}”</li>)}
          </ul>
        </Card>
        <Card title="Incentivo (15 exemplos)">
          <ul className="space-y-1 text-sm">
            {FRASES_INCENTIVO.slice(0, 5).map((f, i) => <li key={i}>“{f}”</li>)}
          </ul>
        </Card>
      </div>
    </Layout>
  )
}
