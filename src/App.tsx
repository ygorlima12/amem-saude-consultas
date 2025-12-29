import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth, useAuthListener } from './hooks/useAuth'

// Páginas
import { LoginPage } from './pages/auth/LoginPage'
import { CadastroPage } from './pages/auth/CadastroPage'
import { ClienteLayout } from './pages/cliente/ClienteLayout'
import { ClienteDashboard } from './pages/cliente/ClienteDashboard'
import { ClienteAgendamentos } from './pages/cliente/ClienteAgendamentos'
import { ClientePagamentos } from './pages/cliente/ClientePagamentos'
import { ClienteReembolsos } from './pages/cliente/ClienteReembolsos'
import { ClientePerfil } from './pages/cliente/ClientePerfil'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminClientes } from './pages/admin/AdminClientes'
import { AdminAgendamentos } from './pages/admin/AdminAgendamentos'

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
        <Route path="agendamentos" element={<ClienteAgendamentos />} />
        <Route path="pagamentos" element={<ClientePagamentos />} />
        <Route path="reembolsos" element={<ClienteReembolsos />} />
        <Route path="perfil" element={<ClientePerfil />} />
      </Route>

      {/* Sistema Administrativo */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="agendamentos" element={<AdminAgendamentos />} />
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
