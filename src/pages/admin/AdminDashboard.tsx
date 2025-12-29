import { Card } from '@/components/ui/Card'
import { Users, Calendar, DollarSign, FileText, TrendingUp, TrendingDown } from 'lucide-react'

export const AdminDashboard = () => {
  const stats = [
    {
      label: 'Total de Clientes',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Agendamentos (Mês)',
      value: '456',
      change: '+8%',
      trend: 'up',
      icon: Calendar,
      color: 'green',
    },
    {
      label: 'Receita (Mês)',
      value: 'R$ 35.420',
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'purple',
    },
    {
      label: 'Reembolsos Pendentes',
      value: '23',
      change: '-5%',
      trend: 'down',
      icon: FileText,
      color: 'orange',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon size={16} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Charts would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Agendamentos por Especialidade</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Gráfico de agendamentos (implementar com Chart.js)
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Gráfico de receita (implementar com Chart.js)
          </div>
        </Card>
      </div>
    </div>
  )
}
