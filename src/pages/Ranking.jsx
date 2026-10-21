import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import KapivarusFala from '../components/kapivarus/KapivarusFala.jsx'
import { dizer } from '../components/kapivarus/falas.mjs'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Confete from '../components/ui/Confete.jsx'
import Trono from '../components/ui/Trono.jsx'
import { IconeCoroa, IconeTrofeu } from '../components/ui/Icones.jsx'
import { repo } from '../lib/repo/index.js'
import { lerPerfilSelecionado } from '../lib/perfil.js'

export default function Ranking() {
  const navigate = useNavigate()
  const perfil = lerPerfilSelecionado()
  const [periodo, setPeriodo] = useState('semanal')
  const [ranking, setRanking] = useState([])
  const [posicaoAtual, setPosicaoAtual] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const contexto = useMemo(() => ({ nome: perfil?.nickname || perfil?.nome || '' }), [perfil])
  const falaRanking = useMemo(() => dizer('ranking', contexto), [contexto])

  useEffect(() => {
    carregarRanking()
  }, [periodo])

  async function carregarRanking() {
    setLoading(true)
    setError(null)

    try {
      // Semana/mês, filtro de privacidade e ordem já vêm resolvidos pelo
      // repositório — igual online e no modo local.
      const filtrado = await repo.carregarRanking(periodo)
      setRanking(filtrado)

      if (perfil?.id) {
        const minhaPosicao = filtrado.findIndex(r => r.child_id === perfil.id)
        if (minhaPosicao >= 0) {
          setPosicaoAtual({
            posicao: filtrado[minhaPosicao].posicao || minhaPosicao + 1,
            xp: filtrado[minhaPosicao].xp_total,
            item: filtrado[minhaPosicao]
          })
        } else {
          setPosicaoAtual(null)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err)
      setError('Não foi possível carregar o ranking')
    } finally {
      setLoading(false)
    }
  }

  const top3 = ranking.slice(0, 3)
  const resto = ranking.slice(3, 10)

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>
          ← Voltar
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <IconeCoroa size={26} />
          Ranking
        </h1>
        <div className="w-20" />
      </div>

      {/* Kapivarus no trono com uma fala do catálogo */}
      <div className="mb-6 flex justify-center">
        <KapivarusFala pose={falaRanking.estado} tom="dica" efeito={falaRanking.efeito} texto={falaRanking.texto} />
      </div>

      {/* Botões de período */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <Button
          variant={periodo === 'semanal' ? 'primario' : 'secundario'}
          onClick={() => setPeriodo('semanal')}
          className="px-4 py-2"
        >
          Semanal
        </Button>
        <Button
          variant={periodo === 'mensal' ? 'primario' : 'secundario'}
          onClick={() => setPeriodo('mensal')}
          className="px-4 py-2"
        >
          Mensal
        </Button>
        <Button
          variant={periodo === 'global' ? 'primario' : 'secundario'}
          onClick={() => setPeriodo('global')}
          className="px-4 py-2"
        >
          Global
        </Button>
      </div>

      {loading && (
        <Card className="p-6 text-center">
          <p className="text-lg">Carregando ranking...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6 text-center border-vermelho-escuro">
          <p className="text-lg text-vermelho-escuro">{error}</p>
          <Button onClick={carregarRanking} className="mt-4">
            Tentar novamente
          </Button>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Pódio */}
          {top3.length > 0 && (
            <div className="relative mb-6">
              {/* Confete comemora o 1º lugar */}
              <Confete quantidade={top3[0] ? 14 : 0} />
              <div className="flex items-end justify-center gap-4">
                {top3[0] && (
                  <div className="flex flex-col items-center">
                    <Trono coroa="ouro" className="mb-2" />
                    <div className="text-center">
                      <span className="medalha medalha-ouro mb-1">🥇 1º</span>
                      <p className="font-semibold">{top3[0].children?.nickname}</p>
                      <p className="text-sm opacity-80">{top3[0].xp_total} XP</p>
                    </div>
                  </div>
                )}
                {top3[1] && (
                  <div className="flex flex-col items-center">
                    <Trono coroa="prata" className="mb-2" />
                    <div className="text-center">
                      <span className="medalha medalha-prata mb-1">🥈 2º</span>
                      <p className="font-semibold">{top3[1].children?.nickname}</p>
                      <p className="text-sm opacity-80">{top3[1].xp_total} XP</p>
                    </div>
                  </div>
                )}
                {top3[2] && (
                  <div className="flex flex-col items-center">
                    <Trono coroa="bronze" className="mb-2" />
                    <div className="text-center">
                      <span className="medalha medalha-bronze mb-1">🥉 3º</span>
                      <p className="font-semibold">{top3[2].children?.nickname}</p>
                      <p className="text-sm opacity-80">{top3[2].xp_total} XP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista 4-10 */}
          {resto.length > 0 && (
            <div className="mb-6 space-y-2">
              {resto.map((item, idx) => {
                const posicao = item.posicao || idx + 4
                return (
                  <Card key={item.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-roxo-claro text-base font-bold text-roxo-escuro">
                        {posicao}
                      </span>
                      <span className="font-semibold">{item.children?.nickname}</span>
                    </div>
                    <span className="font-semibold text-roxo-escuro">{item.xp_total} XP</span>
                  </Card>
                )
              })}
            </div>
          )}

          {ranking.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-lg">Ainda não há dados para este período.</p>
            </Card>
          )}

          {/* Card "Você" */}
          {posicaoAtual && (
            <Card className="p-6 bg-dourado-claro border-dourado-escuro">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
                <IconeTrofeu size={22} />
                Você
              </h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Posição: {posicaoAtual.posicao}º</p>
                  <p className="text-sm opacity-80">XP: {posicaoAtual.xp}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Continue subindo no ranking!</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="secundario" onClick={() => navigate('/hall-da-fama')}>
          🏛️ Ver Hall da Fama
        </Button>
      </div>
    </Layout>
  )
}
