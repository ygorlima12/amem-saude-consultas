import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth, useAuthListener } from './hooks/useAuth'
import { useInitializeAuth } from '@/hooks/useAuth'


// Páginas Cliente
import { LoginPage } from './pages/auth/LoginPage'
import { CadastroPage } from './pages/auth/CadastroPage'
import { ClienteLayout } from './pages/cliente/ClienteLayout'
import { ClienteDashboard } from './pages/cliente/ClienteDashboard'
import { ClienteDados } from './pages/cliente/ClienteDados'
import { ClienteSolicitarAgendamento } from './pages/cliente/ClienteSolicitarAgendamento'
import { ClienteAgendamentos } from './pages/cliente/ClienteAgendamentos'
import { ClienteCancelar } from './pages/cliente/ClienteCancelar'
import { ClientePagamentos } from './pages/cliente/ClientePagamentos'
import { ClienteGuias } from './pages/cliente/ClienteGuias'
import { ClienteReembolsos } from './pages/cliente/ClienteReembolsos'
import { ClienteReembolsosHistorico } from './pages/cliente/ClienteGeralReembolsos'
import { ClienteIndicacao } from './pages/cliente/ClienteIndicacao'
import { ClienteAjuda } from './pages/cliente/ClienteAjuda'
import { ClientePerfil } from './pages/cliente/ClientePerfil'

// Páginas Admin
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminClientes } from './pages/admin/AdminClientes'
import { AdminAgendamentos } from './pages/admin/AdminAgendamentos'
import { AdminAgendamentosPendentes } from './pages/admin/AdminAgendamentosPendentes'
import { AdminEmpresas } from './pages/admin/AdminEmpresas'
import { AdminEstabelecimentos } from './pages/admin/AdminEstabelecimentos'
import { AdminConfiguracoes } from './pages/admin/Adminconfiguracoes'
import { AdminReembolsosPendentes } from './pages/admin/AdminReembolsosPendentes'
import { AdminReembolsos } from './pages/admin/AdminReembolsos'
import { AdminRelatorios } from './pages/admin/AdminRelatorios'
import { AdminEstabelecimentosIndicados } from './pages/admin/AdminEstabelecimentosIndicados'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.tipo_usuario !== 'admin' && user?.tipo_usuario !== 'tecnico') {
    return <Navigate to="/cliente" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.tipo_usuario === 'cliente' ? '/cliente' : '/admin'} replace /> : <LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />

      {/* Portal do Cliente */}
      <Route path="/cliente" element={<ProtectedRoute><ClienteLayout /></ProtectedRoute>}>
        <Route index element={<ClienteDashboard />} />
        <Route path="dados" element={<ClienteDados />} />
        <Route path="solicitar-agendamento" element={<ClienteSolicitarAgendamento />} />
        <Route path="agendamentos" element={<ClienteAgendamentos />} />
        <Route path="cancelar" element={<ClienteCancelar />} />
        <Route path="pagamentos" element={<ClientePagamentos />} />
        <Route path="guias" element={<ClienteGuias />} />
        <Route path="reembolsos" element={<ClienteReembolsosHistorico />} />
        <Route path="reembolsos/solicitar" element={<ClienteReembolsos />} />
        <Route path="indicacao" element={<ClienteIndicacao />} />
        <Route path="ajuda" element={<ClienteAjuda />} />
        <Route path="perfil" element={<ClientePerfil />} />
      </Route>

      {/* Sistema Administrativo */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="agendamentos" element={<AdminAgendamentos />} />
        <Route path="agendamentos/pendentes" element={<AdminAgendamentosPendentes />} />
        <Route path="empresas" element={<AdminEmpresas />} />
        <Route path="estabelecimentos" element={<AdminEstabelecimentos />} />
        {/* <Route path="reembolsos" element={<div>Admin Reembolsos</div>} />
        <Route path="indicacoes" element={<div>Admin Indicações</div>} />
        <Route path="financeiro" element={<div>Admin Financeiro</div>} />*/}
        <Route path="/admin/reembolsos" element={<AdminReembolsos />} />
        <Route path="/admin/reembolsos/pendentes" element={<AdminReembolsosPendentes />} />
        <Route path="configuracoes" element={<AdminConfiguracoes />} />
        <Route path="/admin/relatorios" element={<AdminRelatorios />} />
        <Route 
  path="/admin/estabelecimentos/indicados" 
  element={<AdminEstabelecimentosIndicados />} 
/>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}



export default function App() {
  const { initialize } = useAuth()
  const { setupAuthListener } = useAuthListener()
  

  useEffect(() => {
    initialize()
    setupAuthListener()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}