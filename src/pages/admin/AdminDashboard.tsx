import { useState } from 'react'
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
  XCircle,
  Receipt,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  PiggyBank,
  Activity,
  Target
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { Link } from 'react-router-dom'

export const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('geral')

  // ==================== QUERIES USANDO ApiService ====================

  // Dashboard Geral - Estatísticas
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => ApiService.getDashboardStats(),
    refetchInterval: 30000,
  })

  // Dashboard Geral - Últimos Agendamentos
  const { data: ultimosAgendamentos } = useQuery({
    queryKey: ['ultimos-agendamentos'],
    queryFn: () => ApiService.getUltimosAgendamentos(5),
  })

  // Dashboard Financeiro
  const { data: financeiro } = useQuery({
    queryKey: ['dashboard-financeiro'],
    queryFn: () => ApiService.getDashboardFinanceiro(),
    enabled: activeView === 'financeiro',
  })

  // Dashboard Agendamentos
  const { data: agendamentosStats } = useQuery({
    queryKey: ['dashboard-agendamentos'],
    queryFn: () => ApiService.getDashboardAgendamentos(),
    enabled: activeView === 'agendamentos',
  })

  // Dashboard Reembolsos
  const { data: reembolsosStats } = useQuery({
    queryKey: ['dashboard-reembolsos'],
    queryFn: () => ApiService.getDashboardReembolsos(),
    enabled: activeView === 'reembolsos',
  })

  // ==================== CONFIGURAÇÕES ====================

  const dashboardTabs = [
    { id: 'geral', label: 'Geral', icon: <BarChart3 size={18} /> },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign size={18} /> },
    { id: 'agendamentos', label: 'Agendamentos', icon: <Calendar size={18} /> },
    { id: 'reembolsos', label: 'Reembolsos', icon: <Receipt size={18} /> },
  ]

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
      aprovado: { text: 'Aprovado', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
      recusado: { text: 'Recusado', color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
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

      {/* Navegação entre Dashboards */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {dashboardTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm 
                transition-all duration-200 whitespace-nowrap
                ${activeView === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== DASHBOARD GERAL ==================== */}
      {activeView === 'geral' && (
        <>
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
        </>
      )}

      {/* ==================== DASHBOARD FINANCEIRO ==================== */}
      {activeView === 'financeiro' && financeiro && (
        <div className="space-y-6">
          {/* Cards Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Receita do Mês */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-2">Receita do Mês</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(financeiro.receitaMes)}
                  </h3>
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowUpRight size={16} className="text-green-600" />
                    <span className="text-green-600">23%</span>
                    <span className="text-gray-500">vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Despesas do Mês */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-2">Despesas do Mês</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(financeiro.despesaMes)}
                  </h3>
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowDownRight size={16} className="text-red-600" />
                    <span className="text-red-600">8%</span>
                    <span className="text-gray-500">vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <CreditCard size={24} />
                </div>
              </div>
            </div>

            {/* Lucro do Mês */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-2">Lucro do Mês</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(financeiro.lucroMes)}
                  </h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Target size={16} className="text-primary" />
                    <span className="text-primary">Meta: 85%</span>
                  </div>
                </div>
                <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <PiggyBank size={24} />
                </div>
              </div>
            </div>

            {/* Pagamentos Pendentes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-2">Pag. Pendentes</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {financeiro.pagamentosPendentes}
                  </h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={16} className="text-yellow-600" />
                    <span className="text-yellow-600">Aguardando</span>
                  </div>
                </div>
                <div className="bg-yellow-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                  <Wallet size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receitas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="text-green-600" size={20} />
                Receitas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(financeiro.receitaTotal)}
                    </p>
                  </div>
                  <ArrowUpRight className="text-green-600" size={32} />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Receita Média Mensal</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(financeiro.receitaTotal / 12)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pendente Receber</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {formatCurrency(financeiro.valorPendenteReceber)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Despesas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="text-red-600" size={20} />
                Despesas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Despesa Total</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(financeiro.despesaTotal)}
                    </p>
                  </div>
                  <ArrowDownRight className="text-red-600" size={32} />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reembolsos Pendentes</p>
                    <p className="text-xl font-bold text-gray-900">
                      {financeiro.reembolsosPendentes}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pendente Pagar</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {formatCurrency(financeiro.valorPendentePagar)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Fluxo de Caixa */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Fluxo de Caixa - 12 Meses</h3>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400">Gráfico de fluxo de caixa em breve</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DASHBOARD AGENDAMENTOS ==================== */}
      {activeView === 'agendamentos' && agendamentosStats && (
        <div className="space-y-6">
          {/* Cards de Agendamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{agendamentosStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{agendamentosStats.pendentes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Confirmados</p>
                  <p className="text-2xl font-bold text-gray-900">{agendamentosStats.confirmados}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Cancelados</p>
                  <p className="text-2xl font-bold text-gray-900">{agendamentosStats.cancelados}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Análise de Agendamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Status dos Agendamentos</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="text-yellow-600" size={20} />
                    <span className="font-medium text-gray-900">Pendentes</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {agendamentosStats.pendentes}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-blue-600" size={20} />
                    <span className="font-medium text-gray-900">Confirmados</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {agendamentosStats.confirmados}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-medium text-gray-900">Realizados</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {agendamentosStats.realizados}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="text-red-600" size={20} />
                    <span className="font-medium text-gray-900">Cancelados</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {agendamentosStats.cancelados}
                  </span>
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Métricas</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Agendamentos Este Mês</p>
                  <p className="text-3xl font-bold text-gray-900">{agendamentosStats.esteMes}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Taxa de Cancelamento</p>
                  <p className="text-3xl font-bold text-gray-900">{agendamentosStats.taxaCancelamento}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Taxa de Conversão</p>
                  <p className="text-3xl font-bold text-gray-900">{agendamentosStats.taxaConversao}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DASHBOARD REEMBOLSOS ==================== */}
      {activeView === 'reembolsos' && reembolsosStats && (
        <div className="space-y-6">
          {/* Cards de Reembolsos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Receipt size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{reembolsosStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{reembolsosStats.pendentes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Aprovados</p>
                  <p className="text-2xl font-bold text-gray-900">{reembolsosStats.aprovados}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Recusados</p>
                  <p className="text-2xl font-bold text-gray-900">{reembolsosStats.recusados}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Análise de Reembolsos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Valores */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Valores</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Valor Total Aprovado</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(reembolsosStats.valorTotal)}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Valor Pendente</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {formatCurrency(reembolsosStats.valorPendente)}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Valor Recusado</p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(reembolsosStats.valorRecusado)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Análise</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Reembolsos Este Mês</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reembolsosStats.esteMes}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Taxa de Aprovação</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reembolsosStats.taxaAprovacao}%
                  </p>
                </div>
                <Link 
                  to="/admin/reembolsos" 
                  className="block w-full px-4 py-3 bg-primary text-white text-center rounded-lg hover:bg-primary-600 transition font-medium"
                >
                  Ver Todos Reembolsos →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}