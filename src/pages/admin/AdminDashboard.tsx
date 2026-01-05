import { useQuery } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { Link } from 'react-router-dom'

export const AdminDashboard = () => {
  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: agendamentos } = await ApiService.supabase
        .from('agendamentos')
        .select('*')
      
      const { data: clientes } = await ApiService.supabase
        .from('clientes')
        .select('*')
      
      const hoje = new Date().toISOString().split('T')[0]
      const mesAtual = new Date().getMonth()
      const anoAtual = new Date().getFullYear()

      return {
        totalAgendamentos: agendamentos?.length || 0,
        agendamentosHoje: agendamentos?.filter(a => 
          a.data_agendamento?.startsWith(hoje)
        ).length || 0,
        agendamentosPendentes: agendamentos?.filter(a => 
          a.status === 'pendente'
        ).length || 0,
        totalClientes: clientes?.length || 0,
        receitaMes: agendamentos?.filter(a => {
          const data = new Date(a.data_solicitacao)
          return data.getMonth() === mesAtual && 
                 data.getFullYear() === anoAtual &&
                 a.pago
        }).reduce((sum, a) => sum + (a.valor_coparticipacao || 0), 0) || 0
      }
    },
    refetchInterval: 30000,
  })

  // Buscar últimos agendamentos
  const { data: ultimosAgendamentos } = useQuery({
    queryKey: ['ultimos-agendamentos'],
    queryFn: async () => {
      const { data } = await ApiService.supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*, usuario:usuarios(*)),
          especialidade:especialidades(*)
        `)
        .order('data_solicitacao', { ascending: false })
        .limit(5)
      
      return data
    },
  })

  const statsCards = [
    {
      title: 'Agendamentos Hoje',
      value: stats?.agendamentosHoje || 0,
      icon: <Calendar size={24} />,
      color: 'bg-blue-500',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Pendentes',
      value: stats?.agendamentosPendentes || 0,
      icon: <Clock size={24} />,
      color: 'bg-yellow-500',
      trend: { value: 5, isPositive: false }
    },
    {
      title: 'Total Clientes',
      value: stats?.totalClientes || 0,
      icon: <Users size={24} />,
      color: 'bg-green-500',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Receita Mês',
      value: formatCurrency(stats?.receitaMes || 0),
      icon: <DollarSign size={24} />,
      color: 'bg-primary',
      trend: { value: 15, isPositive: true }
    },
  ]

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string; icon: any }> = {
      pendente: { text: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} /> },
      confirmado: { text: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={14} /> },
      realizado: { text: 'Realizado', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
      cancelado: { text: 'Cancelado', color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
    }
    const badge = badges[status] || badges.pendente
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-2">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                {stat.trend && (
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend.isPositive ? (
                      <TrendingUp size={16} className="text-green-600" />
                    ) : (
                      <TrendingDown size={16} className="text-red-600" />
                    )}
                    <span className={stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                      {stat.trend.value}%
                    </span>
                    <span className="text-gray-500">vs mês anterior</span>
                  </div>
                )}
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {stats && stats.agendamentosPendentes > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Atenção!</h4>
            <p className="text-sm text-yellow-800">
              Você tem <strong>{stats.agendamentosPendentes} solicitações pendentes</strong> aguardando confirmação.{' '}
              <Link to="/admin/agendamentos/pendentes" className="underline font-medium">
                Ver agora
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Últimos Agendamentos */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Últimos Agendamentos</h2>
          <Link 
            to="/admin/agendamentos" 
            className="text-sm text-primary hover:text-primary-600 font-medium"
          >
            Ver todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Especialidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ultimosAgendamentos && ultimosAgendamentos.length > 0 ? (
                ultimosAgendamentos.map((agendamento: any) => (
                  <tr 
                    key={agendamento.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users size={18} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {agendamento.cliente?.usuario?.nome || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {agendamento.cliente?.cpf || 'Sem CPF'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{agendamento.especialidade?.nome || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {agendamento.data_agendamento 
                          ? formatDate(agendamento.data_agendamento)
                          : <span className="text-yellow-600">Aguardando</span>
                        }
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(agendamento.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(agendamento.valor_coparticipacao)}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhum agendamento encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Agendamentos por Mês</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Gráfico em breve</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Especialidades Mais Procuradas</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Gráfico em breve</p>
          </div>
        </div>
      </div>
    </div>
  )
}