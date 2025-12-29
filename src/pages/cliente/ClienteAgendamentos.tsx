import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Calendar, MapPin, Clock, Plus } from 'lucide-react'
import { formatDate, formatCurrency, getStatusLabel } from '@/utils/format'

export const ClienteAgendamentos = () => {
  const [showModal, setShowModal] = useState(false)

  // Mock data
  const agendamentos = [
    {
      id: 1,
      especialidade: 'Cardiologia',
      estabelecimento: 'Hospital São Lucas',
      endereco: 'Rua das Flores, 123 - Centro',
      data: '2024-02-15T14:00:00',
      status: 'confirmado',
      valor: 25.00,
    },
    {
      id: 2,
      especialidade: 'Dermatologia',
      estabelecimento: 'Clínica Saúde Total',
      endereco: 'Av. Principal, 456 - Jardins',
      data: '2024-02-20T10:30:00',
      status: 'pendente',
      valor: 25.00,
    },
  ]

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'warning',
      confirmado: 'success',
      realizado: 'info',
      cancelado: 'danger',
    }
    return variants[status] || 'default'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie suas consultas agendadas</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-4">
        {agendamentos.map((agendamento) => (
          <Card key={agendamento.id}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agendamento.especialidade}
                  </h3>
                  <Badge variant={getStatusVariant(agendamento.status)}>
                    {getStatusLabel(agendamento.status)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{agendamento.estabelecimento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="opacity-0" />
                    <span className="text-gray-500">{agendamento.endereco}</span>
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

              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Coparticipação</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(agendamento.valor)}
                  </p>
                </div>

                <div className="flex gap-2">
                  {agendamento.status === 'pendente' && (
                    <Button size="sm" variant="danger">
                      Cancelar
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Novo Agendamento */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Agendamento"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidade
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option>Selecione...</option>
                <option>Cardiologia</option>
                <option>Dermatologia</option>
                <option>Pediatria</option>
                <option>Ginecologia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estabelecimento
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option>Selecione...</option>
                <option>Hospital São Lucas</option>
                <option>Clínica Saúde Total</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Descreva sintomas ou informações relevantes..."
            />
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Importante:</strong> Após a confirmação do pagamento, sua consulta será agendada em até 7 dias úteis.
              O valor da coparticipação é de <strong>R$ 25,00</strong>.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar Agendamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
