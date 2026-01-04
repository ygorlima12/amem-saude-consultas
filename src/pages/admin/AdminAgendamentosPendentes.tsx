import { useState, useEffect } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { Calendar, Clock, User, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { ApiService } from '@/services/api.service'
import { formatDate, formatCurrency } from '@/utils/format'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Agendamento, Especialidade, Estabelecimento } from '@/types'

export const AdminAgendamentosPendentes = () => {
  const queryClient = useQueryClient()
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Formulário de confirmação
  const [formData, setFormData] = useState({
    data_agendamento: '',
    horario: '',
    estabelecimento_id: '',
    observacoes_admin: '',
  })

  // Buscar agendamentos pendentes
  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos-pendentes'],
    queryFn: async () => {
      const response = await ApiService.getAgendamentosPendentes()
      return response
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })

  // Buscar especialidades
  const { data: especialidades } = useQuery({
    queryKey: ['especialidades'],
    queryFn: () => ApiService.getEspecialidades(),
  })

  // Buscar estabelecimentos
  const { data: estabelecimentos } = useQuery({
    queryKey: ['estabelecimentos'],
    queryFn: () => ApiService.getEstabelecimentos(),
  })

  // Mutation para confirmar agendamento
  const confirmarMutation = useMutation({
    mutationFn: async (data: any) => {
      return await ApiService.confirmarAgendamento(
        selectedAgendamento.id,
        data
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-pendentes'] })
      setShowConfirmModal(false)
      setSelectedAgendamento(null)
      setFormData({
        data_agendamento: '',
        horario: '',
        estabelecimento_id: '',
        observacoes_admin: '',
      })
    },
  })

  // Mutation para recusar agendamento
  const recusarMutation = useMutation({
    mutationFn: async (motivo: string) => {
      return await ApiService.recusarAgendamento(
        selectedAgendamento.id,
        motivo
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-pendentes'] })
      setShowRejectModal(false)
      setSelectedAgendamento(null)
    },
  })

  const handleConfirmar = (agendamento: any) => {
    setSelectedAgendamento(agendamento)
    setShowConfirmModal(true)
  }

  const handleRecusar = (agendamento: any) => {
    setSelectedAgendamento(agendamento)
    setShowRejectModal(true)
  }

  const handleSubmitConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Combinar data e hora
    const dataHora = `${formData.data_agendamento}T${formData.horario}:00`
    
    confirmarMutation.mutate({
      data_agendamento: dataHora,
      estabelecimento_id: parseInt(formData.estabelecimento_id),
      observacoes: formData.observacoes_admin,
    })
  }

  const handleSubmitReject = (e: React.FormEvent) => {
    e.preventDefault()
    const formElement = e.target as HTMLFormElement
    const motivo = (formElement.elements.namedItem('motivo') as HTMLTextAreaElement).value
    recusarMutation.mutate(motivo)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos Pendentes</h1>
        <p className="text-gray-600">
          Gerencie as solicitações de agendamento dos clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {agendamentos?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Confirmados Hoje</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recusados</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert */}
      {agendamentos && agendamentos.length > 0 && (
        <Alert variant="warning">
          <strong>⚠️ Atenção:</strong> Existem {agendamentos.length} solicitações pendentes aguardando confirmação.
        </Alert>
      )}

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {agendamentos && agendamentos.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma solicitação pendente
              </h3>
              <p className="text-gray-600">
                Todas as solicitações foram processadas
              </p>
            </div>
          </Card>
        ) : (
          agendamentos?.map((agendamento: any) => (
            <Card key={agendamento.id}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Informações do Agendamento */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">PENDENTE</Badge>
                    <span className="text-xs text-gray-500">
                      Solicitado em {formatDate(agendamento.data_solicitacao)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <span className="text-gray-600">Cliente: </span>
                        <span className="font-medium text-gray-900">
                          {agendamento.cliente?.usuario?.nome || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <span className="text-gray-600">Especialidade: </span>
                        <span className="font-medium text-gray-900">
                          {agendamento.especialidade?.nome || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <span className="text-gray-600">Preferência: </span>
                        <span className="font-medium text-gray-900">
                          {agendamento.estabelecimento?.nome || 'Qualquer estabelecimento'}
                        </span>
                      </div>
                    </div>

                    {agendamento.observacoes && (
                      <div className="col-span-2 text-sm">
                        <span className="text-gray-600">Observações: </span>
                        <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                          {agendamento.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 lg:w-auto">
                  <Button
                    onClick={() => handleConfirmar(agendamento)}
                    className="w-full lg:w-auto"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Confirmar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRecusar(agendamento)}
                    className="w-full lg:w-auto"
                  >
                    <XCircle size={18} className="mr-2" />
                    Recusar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Agendamento"
        size="lg"
      >
        <form onSubmit={handleSubmitConfirm} className="space-y-4">
          <Alert variant="info">
            <strong>📋 Instruções:</strong> Após marcar manualmente com o estabelecimento,
            preencha os dados abaixo para confirmar o agendamento com o cliente.
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <strong>Cliente:</strong> {selectedAgendamento?.cliente?.usuario?.nome}
            </p>
            <p className="text-sm">
              <strong>Especialidade:</strong> {selectedAgendamento?.especialidade?.nome}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Data do Agendamento"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.data_agendamento}
              onChange={(e) =>
                setFormData({ ...formData, data_agendamento: e.target.value })
              }
            />

            <Input
              type="time"
              label="Horário"
              required
              value={formData.horario}
              onChange={(e) =>
                setFormData({ ...formData, horario: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Estabelecimento *
            </label>
            <select
              required
              value={formData.estabelecimento_id}
              onChange={(e) =>
                setFormData({ ...formData, estabelecimento_id: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Selecione o estabelecimento</option>
              {estabelecimentos?.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nome} - {est.cidade}/{est.estado}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Observações (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Informações adicionais sobre o agendamento..."
              value={formData.observacoes_admin}
              onChange={(e) =>
                setFormData({ ...formData, observacoes_admin: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={confirmarMutation.isPending}>
              Confirmar Agendamento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Recusa */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Recusar Agendamento"
        size="md"
      >
        <form onSubmit={handleSubmitReject} className="space-y-4">
          <Alert variant="warning">
            <strong>⚠️ Atenção:</strong> Ao recusar este agendamento, o cliente será
            notificado. Informe o motivo da recusa.
          </Alert>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Motivo da Recusa *
            </label>
            <textarea
              name="motivo"
              required
              rows={4}
              placeholder="Explique o motivo da recusa do agendamento..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRejectModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={recusarMutation.isPending}
            >
              Recusar Agendamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}