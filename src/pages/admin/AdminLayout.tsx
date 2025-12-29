import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react'

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/clientes', icon: Users, label: 'Clientes' },
  { path: '/admin/agendamentos', icon: Calendar, label: 'Agendamentos' },
  { path: '/admin/reembolsos', icon: FileText, label: 'Reembolsos' },
  { path: '/admin/financeiro', icon: DollarSign, label: 'Financeiro' },
  { path: '/admin/estabelecimentos', icon: Building2, label: 'Estabelecimentos' },
  { path: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
]

export const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
              <span className="font-bold text-lg text-gray-900">Amém Saúde - Admin</span>
            </div>
          </div>

          <div className="text-sm font-medium text-gray-700">
            {user?.nome}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-900 text-white z-50 w-64 transform transition-transform duration-300
          lg:translate-x-0 lg:mt-[57px]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-4 space-y-1 mt-14 lg:mt-0">
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
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 w-full transition-colors mt-4"
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
