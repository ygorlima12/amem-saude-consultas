import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useNotificacoes } from '@/hooks/useNotificacoes'
import {
  Home,
  Calendar,
  DollarSign,
  FileText,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const menuItems = [
  { path: '/cliente', icon: Home, label: 'Início' },
  { path: '/cliente/agendamentos', icon: Calendar, label: 'Agendamentos' },
  { path: '/cliente/pagamentos', icon: DollarSign, label: 'Pagamentos' },
  { path: '/cliente/reembolsos', icon: FileText, label: 'Reembolsos' },
  { path: '/cliente/perfil', icon: User, label: 'Perfil' },
]

export const ClienteLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { countNaoLidas } = useNotificacoes()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary-600" />
              <span className="font-bold text-lg text-gray-900">Amém Saúde</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-600 hover:text-gray-900">
              <Bell size={20} />
              {countNaoLidas > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {countNaoLidas}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.nome.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50 w-64 transform transition-transform duration-300
          lg:translate-x-0 lg:mt-[57px]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-4 space-y-2 mt-14 lg:mt-0">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 mt-[57px] p-6">
        <Outlet />
      </main>
    </div>
  )
}
