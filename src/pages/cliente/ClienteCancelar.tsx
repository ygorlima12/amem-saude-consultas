import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const ClienteCancelar = () => {
  const { cliente } = useAuth()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [cancelled, setCancelled] = useState(false)

  // Buscar agendamentos confirmados do cliente
  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos-confirmados', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return []
      
      const { data, error } = await ApiService.supabase
        .from('agendamentos')
        .select(`
          *,
          estabelecimento:estabelecimentos(id, nome),
          especialidade:especialidades(id, nome)
        `)
        .eq('cliente_id', cliente.id)
        .eq('status', 'confirmado')
        .order('data_agendamento', { ascending: true })
      
      if (error) throw error
      return data || []
    },
    enabled: !!cliente?.id,
  })

  // Mutation para cancelar agendamento
  const cancelarMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await ApiService.supabase
        .from('agendamentos')
        .update({ 
          status: 'cancelado',
          data_cancelamento: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-confirmados'] })
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      setCancelled(true)
      setSelectedId(null)
      setTimeout(() => setCancelled(false), 5000)
    },
    onError: (error: any) => {
      console.error('Erro ao cancelar agendamento:', error)
      alert('Erro ao cancelar agendamento. Tente novamente.')
    },
  })

  const handleCancel = () => {
    if (selectedId && confirm('Tem certeza que deseja cancelar este agendamento?')) {
      cancelarMutation.mutate(selectedId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <Alert variant="warning">
        <strong>⚠️ Atenção:</strong> O cancelamento de agendamentos deve ser feito com antecedência mínima de 24 horas.
        Cancelamentos realizados com menos tempo podem estar sujeitos a cobrança.
      </Alert>

      {cancelled && (
        <Alert variant="success" className="mt-4">
          <strong>✓ Agendamento cancelado com sucesso!</strong><br />
          Você receberá um e-mail de confirmação do cancelamento.
        </Alert>
      )}

      <Card className="mt-6">
        <CardTitle subtitle="Selecione o agendamento que deseja cancelar">
          Cancelar Agendamento
        </CardTitle>

        {!agendamentos || agendamentos.length === 0 ? (
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
              {agendamentos.map((agendamento: any) => (
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
                          {agendamento.especialidade?.nome || agendamento.tipo_consulta || 'Consulta'}
                        </h3>
                        <Badge variant="success">CONFIRMADO</Badge>
                      </div>
                      <p className="text-sm text-text-secondary mb-1">
                        <strong>Local:</strong> {agendamento.estabelecimento?.nome || 'Não informado'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <strong>Data e Hora:</strong>{' '}
                        {agendamento.data_agendamento 
                          ? new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')
                          : 'Data não definida'
                        }
                        {agendamento.horario && ` às ${agendamento.horario}`}
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
                disabled={!selectedId || cancelarMutation.isPending}
                onClick={handleCancel}
                isLoading={cancelarMutation.isPending}
              >
                {cancelarMutation.isPending 
                  ? 'Cancelando...' 
                  : 'Cancelar Agendamento Selecionado'
                }
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}