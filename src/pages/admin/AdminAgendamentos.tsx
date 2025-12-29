import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Calendar, Clock, User, MapPin } from 'lucide-react'
import { formatDate, formatCurrency } from '@/utils/format'

export const AdminAgendamentos = () => {
  const agendamentos = [
    {
      id: 1,
      cliente: 'João da Silva',
      especialidade: 'Cardiologia',
      estabelecimento: 'Hospital São Lucas',
      data: '2024-02-15T14:00:00',
      status: 'confirmado',
      valor: 25.00,
    },
    {
      id: 2,
      cliente: 'Maria Santos',
      especialidade: 'Dermatologia',
      data: '2024-02-20T10:30:00',
      estabelecimento: 'Clínica Saúde Total',
      status: 'pendente',
      valor: 25.00,
    },
  ]

  const getStatusVariant = (status: string): any => {
    const variants: Record<string, string> = {
      pendente: 'warning',
      confirmado: 'success',
      realizado: 'info',
      cancelado: 'danger',
    }
    return variants[status] || 'default'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        <p className="text-gray-600">Gerencie os agendamentos de consultas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-sm text-gray-600">Hoje</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-gray-600">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">8</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-gray-600">Confirmados</p>
          <p className="text-2xl font-bold text-green-600">45</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-gray-600">Este Mês</p>
          <p className="text-2xl font-bold text-gray-900">156</p>
        </Card>
      </div>

      {/* List */}
      <div className="space-y-4">
        {agendamentos.map((agendamento) => (
          <Card key={agendamento.id}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agendamento.especialidade}
                  </h3>
                  <Badge variant={getStatusVariant(agendamento.status)}>
                    {agendamento.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{agendamento.cliente}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{agendamento.estabelecimento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(agendamento.data)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>
                      {new Date(agendamento.data).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Coparticipação</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(agendamento.valor)}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
