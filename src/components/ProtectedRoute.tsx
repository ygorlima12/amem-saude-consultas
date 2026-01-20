import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredType: 'admin' | 'cliente'
}

export const ProtectedRoute = ({ children, requiredType }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.tipo_usuario !== requiredType) {
    // Admin tentando acessar /cliente → redireciona para /admin
    // Cliente tentando acessar /admin → redireciona para /cliente
    const redirectTo = user.tipo_usuario === 'admin' ? '/admin' : '/cliente'
    console.log(`⚠️ Tipo incorreto. Redirecionando para ${redirectTo}`)
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
