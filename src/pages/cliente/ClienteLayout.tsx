import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { X, Menu, LogOut } from 'lucide-react'

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
        {/* Top Header */}
        <header className="bg-white px-10 py-5 shadow-header flex-shrink-0 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-secondary-900 hover:text-primary"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <h1 className="text-[26px] font-bold text-secondary-900">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Portal do Beneficiário'}
          </h1>

          <div className="hidden sm:block text-sm text-text-secondary">
            Olá, <span className="font-semibold text-text-primary">{user?.nome.split(' ')[0]}</span>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
