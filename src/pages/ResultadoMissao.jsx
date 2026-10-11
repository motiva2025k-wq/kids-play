// ResultadoMissao — versão compacta da tela de resultado, caso você queira
// separar a apresentação do motor. Por enquanto é quase idêntica ao final de
// MissaoNova, mas aqui focada em resumo rápido + botão de nova tentativa.
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Kapivarus from '../components/kapivarus/Kapivarus.jsx'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Confete from '../components/ui/Confete.jsx'
import HudItem from '../components/ui/HudItem.jsx'
import { IconeMoeda, IconeEstrela } from '../components/ui/Icones.jsx'
import Layout from '../components/Layout.jsx'
import { pegarFraseAleatoria } from '../data/frasesKapivarus.js'

export default function ResultadoMissao({ resultado, novaTentativa }) {
  const navegar = useNavigate()
  const [feito, setFeito] = useState(false)

  const handleNovaTentativa = useCallback(() => {
    if (novaTentativa) novaTentativa()
    setFeito(true)
  }, [novaTentativa])

  if (feito) {
    return (
      <Layout>
        <Card className="mx-auto mt-10 max-w-md p-6 text-center">
          <p className="text-lg">Carregando nova tentativa…</p>
        </Card>
      </Layout>
    )
  }

  if (!resultado) {
    return (
      <Layout>
        <Card className="mx-auto mt-10 max-w-md p-6 text-center">
          <p className="text-lg">Sem dados de resultado.</p>
          <Button className="mt-4" onClick={() => navegar('/home')}>Ir para Home</Button>
        </Card>
      </Layout>
    )
  }

  const estrela = '★'
  const vazia = '☆'
  const linhasEstrelas = Array.from({ length: 3 }).map((_, i) =>
    i < resultado.estrelas ? estrela : vazia,
  ).join(' ')

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navegar('/home')}>
          ← Trilha
        </Button>
        <div className="text-center">
          <div className="text-sm font-semibold opacity-60">Resultado</div>
        </div>
        <div className="w-[90px]" />
      </div>

      {/* Confete quando a missão foi brilhante (3 estrelas) */}
      {resultado.estrelas >= 3 && <Confete quantidade={16} />}

      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <Kapivarus
          pose={resultado.estrelas >= 3 ? 'comemorando' : resultado.estrelas >= 2 ? 'feliz' : 'incentivando'}
          size={160}
        />

        <div className="flex gap-2 text-5xl text-dourado" aria-label="estrelas">
          {linhasEstrelas}
        </div>

        <Card className="max-w-sm px-6 py-5 text-center">
          <p className="text-xl font-bold">{resultado.acertos} de {resultado.total}</p>
          <p className="mt-2 opacity-80">
            {resultado.percentual}% de acertos
          </p>
        </Card>

        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <HudItem
            icone={<IconeEstrela size={26} />}
            animar="estrela-pulsar"
            cor="dourado"
            rotulo="XP"
            valor={`+${resultado.xp}`}
          />
          <HudItem
            icone={<IconeMoeda size={26} />}
            animar="moeda-girar"
            cor="verde"
            rotulo="Moedas"
            valor={`+${resultado.moedas}`}
          />
        </div>

        <div className="flex justify-center">
          <KapivarusFala
            pose="feliz"
            tom="acerto"
            texto={pegarFraseAleatoria('acerto')}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button className="btn-jogo" onClick={() => navegar('/home')}>
          🏁 Voltar para a trilha
        </Button>
        <Button variant="secundario" onClick={handleNovaTentativa}>
          Tentar de novo (metade do XP)
        </Button>
      </div>
    </Layout>
  )
}
