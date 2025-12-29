import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Calendar, DollarSign, FileText, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const ClienteDashboard = () => {
  const { user, cliente } = useAuth()
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Agendamentos Ativos',
      value: '3',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Pagamentos Pendentes',
      value: 'R$ 75,00',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Reembolsos',
      value: '1',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Próxima Consulta',
      value: '5 dias',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Olá, {user?.nome.split(' ')[0]}! 👋
        </h1>
        <p className="text-primary-50">
          Bem-vindo ao seu portal de saúde. Aqui você pode gerenciar suas consultas e agendamentos.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-center gap-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader
          title="Ações Rápidas"
          subtitle="Acesse as funcionalidades mais usadas"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/cliente/agendamentos')}
            className="h-auto flex-col items-start p-4 text-left"
          >
            <Calendar className="mb-2" size={24} />
            <div>
              <div className="font-semibold">Novo Agendamento</div>
              <div className="text-sm text-gray-500">Agendar uma consulta</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/cliente/reembolsos')}
            className="h-auto flex-col items-start p-4 text-left"
          >
            <FileText className="mb-2" size={24} />
            <div>
              <div className="font-semibold">Solicitar Reembolso</div>
              <div className="text-sm text-gray-500">Reembolso de consultas</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/cliente/perfil')}
            className="h-auto flex-col items-start p-4 text-left"
          >
            <FileText className="mb-2" size={24} />
            <div>
              <div className="font-semibold">Meus Dados</div>
              <div className="text-sm text-gray-500">Atualizar informações</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title="Atividades Recentes"
          subtitle="Últimas ações na sua conta"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Agendamento confirmado</p>
                <p className="text-sm text-gray-500">Cardiologia - Dr. João Silva</p>
              </div>
            </div>
            <Badge variant="success">Confirmado</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Pagamento realizado</p>
                <p className="text-sm text-gray-500">Coparticipação - R$ 25,00</p>
              </div>
            </div>
            <Badge variant="success">Pago</Badge>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary-50 border border-primary-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="text-primary-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Valor da Coparticipação
            </h3>
            <p className="text-gray-700">
              O valor fixo por consulta é de <strong>R$ 25,00</strong>. Seu limite mensal é de <strong>R$ 400,00</strong>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
