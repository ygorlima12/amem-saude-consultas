import { StatCard } from '@/components/admin/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { Users, Calendar, DollarSign, FileText, Activity, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export const AdminDashboard = () => {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Total de Clientes',
      value: '1,234',
      icon: Users,
      iconColor: 'primary' as const,
      trend: { value: '+12% este mês', isUp: true },
    },
    {
      title: 'Agendamentos',
      value: '456',
      icon: Calendar,
      iconColor: 'secondary' as const,
      trend: { value: '+8% este mês', isUp: true },
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 35.420',
      icon: DollarSign,
      iconColor: 'success' as const,
      trend: { value: '+15% este mês', isUp: true },
    },
    {
      title: 'Reembolsos Pendentes',
      value: '23',
      icon: FileText,
      iconColor: 'warning' as const,
      trend: { value: '-5% este mês', isUp: false },
    },
    {
      title: 'Taxa de Utilização',
      value: '87%',
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
      {/* Header */}
      <div className="bg-white rounded-card p-8 mb-8 shadow-card-md">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[28px] font-bold text-secondary-900 mb-1">
              Dashboard
            </h2>
            <p className="text-text-light text-sm">
              Visão geral do sistema de gerenciamento
            </p>
          </div>

          <div className="flex items-center gap-3 bg-bg-gray px-4 py-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-avatar flex items-center justify-center text-white font-semibold">
              {user?.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-dark">
                {user?.nome}
              </h4>
              <p className="text-xs text-text-light">
                Administrador
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
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

      {/* Recent Activity */}
      <Card>
        <CardTitle subtitle="Últimas atividades do sistema">
          Atividades Recentes
        </CardTitle>
        <div className="space-y-3">
          {[
            { text: 'Novo cliente cadastrado: João Silva', time: 'Há 5 minutos', type: 'success' },
            { text: 'Agendamento confirmado: Maria Santos - Cardiologia', time: 'Há 15 minutos', type: 'info' },
            { text: 'Reembolso aprovado: Pedro Oliveira - R$ 150,00', time: 'Há 1 hora', type: 'success' },
            { text: 'Pagamento recebido: Ana Costa - R$ 25,00', time: 'Há 2 horas', type: 'success' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-bg-gray rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'success' ? 'bg-success-500' : 'bg-info-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-text-primary">{activity.text}</p>
                <p className="text-xs text-text-secondary mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
