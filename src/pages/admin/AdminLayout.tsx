import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
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
  ClipboardList,
  MapPin,
  Bell,
  AlertCircle,
} from 'lucide-react'

const menuSections = [
  {
    title: 'PRINCIPAL',
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    title: 'GERENCIAMENTO',
    items: [
      { path: '/admin/clientes', icon: Users, label: 'Clientes' },
      { path: '/admin/empresas', icon: Building2, label: 'Empresas' },
    ],
  },
  {
    title: 'AGENDAMENTOS',
    items: [
      { path: '/admin/agendamentos/pendentes', icon: AlertCircle, label: 'Agendamentos Pendentes', badge: true },
      { path: '/admin/agendamentos', icon: Calendar, label: 'Agendamentos' },
    ],
  },
  {
    title: 'REEMBOLSOS',
    items: [
      { path: '/admin/reembolsos/pendentes', icon: AlertCircle, label: 'Reembolsos Pendentes' },
      { path: '/admin/reembolsos', icon: FileText, label: 'Reembolsos' },
    ],
  },
  {
    title: 'INDICAÇÕES',
    items: [
      { path: '/admin/estabelecimentos/indicados', icon: AlertCircle, label: 'Estabelecimentos Indicados' },
      { path: '/admin/estabelecimentos', icon: MapPin, label: 'Estabelecimentos' },
    ],
  },
  {
    title: 'RELATÓRIOS',
    items: [
      { path: '/admin/relatorios', icon: FileText, label: 'Relatórios' },
      { path: '/admin/financeiro', icon: DollarSign, label: 'Financeiro' },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { path: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
    ],
  },
]

export const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Buscar quantidade de agendamentos pendentes
  const { data: pendentesCount } = useQuery({
    queryKey: ['agendamentos-pendentes-count'],
    queryFn: async () => {
      const data = await ApiService.getAgendamentosPendentes()
      return data?.length || 0
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fa]">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-admin text-white z-50
          w-[280px] flex-shrink-0 transition-transform duration-300 ease-in-out
          overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
          shadow-sidebar
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-8 border-b border-white/10 mb-8">
          <div className="bg-white p-4 rounded-xl text-center">
            <img src="/logo-amem.png" alt="Admin Logo" className="mx-auto h-10 mb-2" />
            <p className="text-secondary text-[11px] mt-1 font-medium">Sistema Administrativo</p>
          </div>
        </div>

        {/* Menu */}
        <nav>
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              <div className="px-6 text-white/50 text-[11px] font-semibold uppercase tracking-wide mb-2.5">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                const showBadge = item.badge && pendentesCount && pendentesCount > 0

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center justify-between px-6 py-3 transition-all duration-300
                      border-l-[3px] relative
                      ${isActive
                        ? 'bg-primary/15 border-l-primary text-primary font-semibold'
                        : 'border-l-transparent text-white/80 hover:bg-white/5 hover:text-primary hover:border-l-primary'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <Icon size={18} className="mr-3 flex-shrink-0" style={{ width: '20px' }} />
                      <span>{item.label}</span>
                    </div>
                    {showBadge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {pendentesCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-danger-500/15 border border-danger-500/30 text-danger-500 rounded-button font-semibold text-sm transition-all hover:bg-danger-500/25"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-[280px]">
        {/* Top Header */}
        <div className="bg-white border-b p-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-secondary-900"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}