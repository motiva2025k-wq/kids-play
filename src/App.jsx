import { Navigate, Route, Routes } from 'react-router-dom'
import AvisoConfiguracao from './components/AvisoConfiguracao.jsx'
import { useAuth } from './contexts/AuthContext.jsx'
import Acerto from './pages/Acerto.jsx'
import Cadastro from './pages/Cadastro.jsx'
import CriarPerfil from './pages/CriarPerfil.jsx'
import ErroGentil from './pages/ErroGentil.jsx'
import Galeria from './pages/Galeria.jsx'
import GuiaVisual from './pages/GuiaVisual.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Missao from './pages/Missao.jsx'
import MissaoNova from './pages/MissaoNova.jsx'
import ResultadoMissao from './pages/ResultadoMissao.jsx'
import Painel from './pages/Painel.jsx'
import Ranking from './pages/Ranking.jsx'
import HallDaFama from './pages/HallDaFama.jsx'
import PainelResponsavel from './pages/PainelResponsavel.jsx'
import Loja from './pages/Loja.jsx'
import Inventario from './pages/Inventario.jsx'
import RelatoriosPais from './pages/RelatoriosPais.jsx'
import AdminImport from './pages/AdminImport.jsx'
import AdminRevisar from './pages/AdminRevisar.jsx'
import Reforco from './pages/Reforco.jsx'
import PainelPais from './pages/PainelPais.jsx'
import Privacidade from './pages/Privacidade.jsx'
import Termos from './pages/Termos.jsx'
import SegurancaParaPais from './pages/SegurancaParaPais.jsx'
import SelecionarPerfil from './pages/SelecionarPerfil.jsx'

function TelaCarregando() {
  return (
    <div className="flex min-h-screen items-center justify-center text-xl font-semibold">
      Carregando…
    </div>
  )
}

// Protege as telas: sem login, manda para /login.
function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth()
  if (carregando) return <TelaCarregando />
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

// Telas de login/cadastro: se já logado, manda direto para /perfis.
function RotaPublica({ children }) {
  const { usuario, carregando } = useAuth()
  if (carregando) return <TelaCarregando />
  if (usuario) return <Navigate to="/perfis" replace />
  return children
}

export default function App() {
  const { supabaseConfigurado } = useAuth()

  if (!supabaseConfigurado) return <AvisoConfiguracao />

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/login"
        element={
          <RotaPublica>
            <Login />
          </RotaPublica>
        }
      />
      <Route
        path="/cadastro"
        element={
          <RotaPublica>
            <Cadastro />
          </RotaPublica>
        }
      />
      <Route
        path="/criar-perfil"
        element={
          <RotaProtegida>
            <CriarPerfil />
          </RotaProtegida>
        }
      />
      <Route
        path="/perfis"
        element={
          <RotaProtegida>
            <SelecionarPerfil />
          </RotaProtegida>
        }
      />
      <Route
        path="/painel"
        element={
          <RotaProtegida>
            <Painel />
          </RotaProtegida>
        }
      />
      <Route
        path="/galeria"
        element={
          <RotaProtegida>
            <Galeria />
          </RotaProtegida>
        }
      />
      <Route
        path="/home"
        element={
          <RotaProtegida>
            <Home />
          </RotaProtegida>
        }
      />
      <Route
        path="/missao"
        element={
          <RotaProtegida>
            <Missao />
          </RotaProtegida>
        }
      />
      <Route
        path="/missao/:id"
        element={
          <RotaProtegida>
            <MissaoNova />
          </RotaProtegida>
        }
      />
      <Route
        path="/resultado"
        element={
          <RotaProtegida>
            <ResultadoMissao />
          </RotaProtegida>
        }
      />
      <Route
        path="/ranking"
        element={
          <RotaProtegida>
            <Ranking />
          </RotaProtegida>
        }
      />
      <Route
        path="/hall-da-fama"
        element={
          <RotaProtegida>
            <HallDaFama />
          </RotaProtegida>
        }
      />
      <Route
        path="/painel-responsavel"
        element={
          <RotaProtegida>
            <PainelResponsavel />
          </RotaProtegida>
        }
      />
      <Route
        path="/loja"
        element={
          <RotaProtegida>
            <Loja />
          </RotaProtegida>
        }
      />
      <Route
        path="/inventario"
        element={
          <RotaProtegida>
            <Inventario />
          </RotaProtegida>
        }
      />
      <Route
        path="/relatorios-pais"
        element={
          <RotaProtegida>
            <RelatoriosPais />
          </RotaProtegida>
        }
      />
      <Route
        path="/admin/importar"
        element={
          <RotaProtegida>
            <AdminImport />
          </RotaProtegida>
        }
      />
      <Route
        path="/admin/revisar"
        element={
          <RotaProtegida>
            <AdminRevisar />
          </RotaProtegida>
        }
      />
      <Route
        path="/reforco"
        element={
          <RotaProtegida>
            <Reforco />
          </RotaProtegida>
        }
      />
      <Route
        path="/pais"
        element={
          <RotaProtegida>
            <PainelPais />
          </RotaProtegida>
        }
      />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/seguranca-para-pais" element={<SegurancaParaPais />} />
      <Route
        path="/acerto"
        element={
          <RotaProtegida>
            <Acerto />
          </RotaProtegida>
        }
      />
      <Route
        path="/erro-gentil"
        element={
          <RotaProtegida>
            <ErroGentil />
          </RotaProtegida>
        }
      />
      <Route
        path="/guia-visual"
        element={<GuiaVisual />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
