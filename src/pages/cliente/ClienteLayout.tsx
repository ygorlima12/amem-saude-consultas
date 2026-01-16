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

  // ✅ Proteção para nome undefined
  const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'Usuário'
  const inicialNome = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <aside className={`fixed top-0 left-0 h-full bg-secondary-900 text-white z-50 w-[280px] flex-shrink-0 transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-white p-6 border-b border-white/10 text-center">
          <div className="max-w-[160px] mx-auto mb-4">
            <div className="text-primary font-bold text-2xl">Amém Saúde</div>
            <div className="text-secondary text-xs mt-1">Portal do Beneficiário</div>
          </div>
        </div>

        <div className="bg-secondary-900 py-3 px-5 min-h-[12px]"></div>

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
                      block px-5 py-3.5 text-[13px] transition-all duration-200
                      border-l-[3px] 
                      ${isActive 
                        ? 'bg-primary/10 border-primary text-white font-medium' 
                        : 'border-transparent text-white/80 hover:bg-white/5 hover:border-primary/50 hover:text-white'
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

        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/10 bg-secondary-900">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:text-primary transition-colors" />
            <span className="group-hover:text-white transition-colors">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col lg:ml-[280px] bg-gradient-to-br from-gray-50 to-white">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Menu size={24} className="text-gray-600" />
                </button>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <User size={14} />
                    <ChevronRight size={12} />
                    <span className="truncate">
                      {menuItems.find(item => item.path === location.pathname)?.label || 'Início'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 truncate">
                    {menuItems.find(item => item.path === location.pathname)?.label || 'Portal do Beneficiário'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                  <Bell size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white"></span>
                </button>

                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary leading-tight">
                      {primeiroNome}
                    </p>
                    <p className="text-xs text-text-secondary">Beneficiário</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-avatar flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                    {inicialNome}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 sm:py-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}