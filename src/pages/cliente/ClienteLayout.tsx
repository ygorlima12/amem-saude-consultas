import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { X, Menu, LogOut, Bell, User, ChevronRight } from 'lucide-react'

const menuItems = [
  { path: '/cliente', label: 'Início', section: 'MENU PRINCIPAL' },
  { path: '/cliente/dados', label: 'Meus Dados', section: 'DADOS' },
  { path: '/cliente/solicitar-agendamento', label: 'Solicitar Agendamento', section: 'AGENDAMENTOS' },
  { path: '/cliente/agendamentos', label: 'Meus Agendamentos', section: 'AGENDAMENTOS' },
  { path: '/cliente/cancelar', label: 'Cancelar Agendamento', section: 'AGENDAMENTOS' },
  { path: '/cliente/pagamentos', label: 'Coparticipação', section: 'PAGAMENTOS' },
  { path: '/cliente/guias', label: 'Guias de Atendimento', section: 'DOCUMENTOS' },
  { path: '/cliente/reembolsos', label: 'Solicitar Reembolso', section: 'REEMBOLSO' },
  { path: '/cliente/reembolso-consulta', label: 'Reembolso - Consulta', section: 'REEMBOLSO' },
  { path: '/cliente/reembolso-exames', label: 'Reembolso - Exames', section: 'REEMBOLSO' },
  { path: '/cliente/indicacao', label: 'Indicar Estabelecimento', section: 'INDICAÇÃO' },
  { path: '/cliente/ajuda', label: 'Ajuda', section: 'SUPORTE' },
]

// Agrupar itens por seção
const groupedMenu = menuItems.reduce((acc, item) => {
  if (!acc[item.section]) {
    acc[item.section] = []
  }
  acc[item.section].push(item)
  return acc
}, {} as Record<string, typeof menuItems>)

export const ClienteLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-secondary-900 text-white z-50
          w-[280px] flex-shrink-0 transition-transform duration-300 ease-in-out
          overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Header */}
        <div className="bg-white p-6 border-b border-white/10 text-center">
          <div className="max-w-[160px] mx-auto mb-4">
            <div className="text-primary font-bold text-2xl">Amém Saúde</div>
            <div className="text-secondary text-xs mt-1">Portal do Beneficiário</div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-secondary-900 py-3 px-5 min-h-[12px]">
          {/* Vazio conforme original */}
        </div>

        {/* Menu */}
        <nav className="py-5">
          {Object.entries(groupedMenu).map(([section, items]) => (
            <div key={section} className="mb-2">
              <div className="px-5 py-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-primary/80">
                {section}
              </div>
              {items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      block px-5 py-3 text-base transition-all duration-200
                      border-l-[3px] select-none
                      ${isActive
                        ? 'bg-primary/15 border-l-primary text-white font-semibold'
                        : 'border-l-transparent text-white/80 hover:bg-white/5 hover:text-white hover:border-l-primary'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-3 bg-danger-500/15 border border-danger-500/30 text-[#ff6b6b] rounded-button font-semibold text-sm transition-all hover:bg-danger-500/25"
          >
            <LogOut className="inline mr-2" size={16} />
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
        {/* Top Header - Mais Moderno */}
        <header className="bg-white border-b border-gray-100 flex-shrink-0 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
          <div className="px-6 sm:px-10 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left Side */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-secondary-900 hover:text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                <div className="min-w-0 flex-1">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
                    <span>Portal</span>
                    <ChevronRight size={14} />
                    <span className="text-primary font-medium truncate">
                      {menuItems.find(item => item.path === location.pathname)?.label || 'Início'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 truncate">
                    {menuItems.find(item => item.path === location.pathname)?.label || 'Portal do Beneficiário'}
                  </h1>
                </div>
              </div>

              {/* Right Side - User Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                  <Bell size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* User Avatar */}
                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary leading-tight">
                      {user?.nome.split(' ')[0]}
                    </p>
                    <p className="text-xs text-text-secondary">Beneficiário</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-avatar flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                    {user?.nome.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 sm:py-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
