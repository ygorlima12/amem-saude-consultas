import { useQuery } from '@tanstack/react-query'
import { StatCard } from '@/components/admin/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { Users, Calendar, DollarSign, FileText, Activity, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'
import { formatCurrency } from '@/utils/format'

export const AdminDashboard = () => {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => ApiService.getDashboardStats(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total de Clientes',
      value: stats?.totalClientes || 0,
      icon: Users,
      iconColor: 'primary' as const,
    },
    {
      title: 'Agendamentos',
      value: stats?.totalAgendamentos || 0,
      icon: Calendar,
      iconColor: 'secondary' as const,
    },
    {
      title: 'Receita Mensal',
      value: formatCurrency(stats?.receitaMes || 0),
      icon: DollarSign,
      iconColor: 'success' as const,
    },
    {
      title: 'Reembolsos Pendentes',
      value: stats?.reembolsosPendentes || 0,
      icon: FileText,
      iconColor: 'warning' as const,
    },
    {
      title: 'Agendamentos Pendentes',
      value: stats?.agendamentosPendentes || 0,
      icon: Activity,
      iconColor: 'primary' as const,
    },
    {
      title: 'Estabelecimentos',
      value: '48',
      icon: Building2,
      iconColor: 'secondary' as const,
    },
  ]

  return (
    <div>
      <div className="bg-white rounded-card p-8 mb-8 shadow-card-md">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[28px] font-bold text-secondary-900 mb-1">Dashboard</h2>
            <p className="text-text-light text-sm">Visão geral do sistema de gerenciamento</p>
          </div>
          <div className="flex items-center gap-3 bg-bg-gray px-4 py-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-avatar flex items-center justify-center text-white font-semibold">
              {user?.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-dark">{user?.nome}</h4>
              <p className="text-xs text-text-light">Administrador</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {statsCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Card>
          <CardTitle>Agendamentos por Especialidade</CardTitle>
          <div className="h-64 flex items-center justify-center text-text-secondary bg-bg-gray rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm">Gráfico de agendamentos</p>
              <p className="text-xs mt-1">(Chart.js)</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Receita Mensal</CardTitle>
          <div className="h-64 flex items-center justify-center text-text-secondary bg-bg-gray rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-sm">Gráfico de receita</p>
              <p className="text-xs mt-1">(Chart.js)</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle subtitle="Últimas atividades do sistema">Atividades Recentes</CardTitle>
        <div className="space-y-3">
          {stats?.agendamentosPendentes && stats.agendamentosPendentes > 0 ? (
            <div className="flex items-start gap-3 p-3 bg-bg-gray rounded-lg">
              <div className="w-2 h-2 rounded-full mt-2 bg-warning-500" />
              <div className="flex-1">
                <p className="text-sm text-text-primary">
                  {stats.agendamentosPendentes} agendamento(s) aguardando confirmação
                </p>
                <p className="text-xs text-text-secondary mt-1">Agora</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-bg-gray rounded-lg">
              <div className="w-2 h-2 rounded-full mt-2 bg-success-500" />
              <div className="flex-1">
                <p className="text-sm text-text-primary">Sistema funcionando normalmente</p>
                <p className="text-xs text-text-secondary mt-1">Agora</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}