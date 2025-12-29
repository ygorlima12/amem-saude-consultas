import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const ClienteCancelar = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [cancelled, setCancelled] = useState(false)

  // Mock data
  const agendamentos = [
    {
      id: 1,
      especialidade: 'Cardiologia',
      estabelecimento: 'Clínica Saúde Plena',
      data: '2024-02-20',
      horario: '14:00',
      status: 'confirmado',
    },
    {
      id: 2,
      especialidade: 'Dermatologia',
      estabelecimento: 'Hospital São Lucas',
      data: '2024-02-25',
      horario: '10:30',
      status: 'confirmado',
    },
  ]

  const handleCancel = () => {
    if (selectedId && confirm('Tem certeza que deseja cancelar este agendamento?')) {
      // TODO: Implementar cancelamento no Supabase
      setCancelled(true)
      setSelectedId(null)
      setTimeout(() => setCancelled(false), 5000)
    }
  }

  return (
    <div>
      <Alert variant="warning">
        <strong>⚠️ Atenção:</strong> O cancelamento de agendamentos deve ser feito com antecedência mínima de 24 horas.
        Cancelamentos realizados com menos tempo podem estar sujeitos a cobrança.
      </Alert>

      {cancelled && (
        <Alert variant="info">
          <strong>✓ Agendamento cancelado com sucesso!</strong><br />
          Você receberá um e-mail de confirmação do cancelamento.
        </Alert>
      )}

      <Card>
        <CardTitle subtitle="Selecione o agendamento que deseja cancelar">
          Cancelar Agendamento
        </CardTitle>

        {agendamentos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2.5">
              Nenhum agendamento disponível
            </h3>
            <p className="text-sm text-text-secondary">
              Você não possui agendamentos confirmados para cancelar
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {agendamentos.map((agendamento) => (
                <div
                  key={agendamento.id}
                  onClick={() => setSelectedId(agendamento.id)}
                  className={`
                    p-5 border-2 rounded-xl cursor-pointer transition-all
                    ${selectedId === agendamento.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-secondary-900">
                          {agendamento.especialidade}
                        </h3>
                        <Badge variant="success">CONFIRMADO</Badge>
                      </div>
                      <p className="text-sm text-text-secondary mb-1">
                        <strong>Local:</strong> {agendamento.estabelecimento}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <strong>Data e Hora:</strong>{' '}
                        {new Date(agendamento.data).toLocaleDateString('pt-BR')} às {agendamento.horario}
                      </p>
                    </div>
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${selectedId === agendamento.id
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                      }
                    `}>
                      {selectedId === agendamento.id && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                variant="danger"
                disabled={!selectedId}
                onClick={handleCancel}
              >
                Cancelar Agendamento Selecionado
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
