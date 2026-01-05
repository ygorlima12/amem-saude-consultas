import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Calendar, MapPin, Clock, DollarSign, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { formatDate, formatCurrency, getStatusLabel } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'
import { useNavigate } from 'react-router-dom'

export const ClienteAgendamentos = () => {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [pixCopiado, setPixCopiado] = useState(false)

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos', cliente?.id],
    queryFn: () => ApiService.getAgendamentos(cliente!.id),
    enabled: !!cliente?.id,
  })

  const cancelarMutation = useMutation({
    mutationFn: (agendamentoId: number) => ApiService.cancelarAgendamento(agendamentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      alert('Agendamento cancelado com sucesso!')
    },
  })

  const informarPagamentoMutation = useMutation({
    mutationFn: (agendamentoId: number) => ApiService.informarPagamento(agendamentoId),
    onSuccess: () => {
      alert('Pagamento informado! Nossa equipe irá verificar e confirmar em breve.')
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
    },
  })

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'warning',
      confirmado: 'success',
      realizado: 'info',
      cancelado: 'danger',
    }
    return variants[status] || 'neutral'
  }

  const handleCancelar = (agendamentoId: number) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      cancelarMutation.mutate(agendamentoId)
    }
  }

  const handleVerDetalhes = (agendamento: any) => {
    setSelectedAgendamento(agendamento)
    setShowDetalhesModal(true)
    setPixCopiado(false)
  }

  const handleInformarPagamento = (agendamentoId: number) => {
    if (confirm('Você confirma que realizou o pagamento? Nossa equipe irá verificar.')) {
      informarPagamentoMutation.mutate(agendamentoId)
      setShowDetalhesModal(false)
    }
  }

  const copiarPixCopiaECola = () => {
    if (selectedAgendamento?.qrcode_pagamento) {
      // Se o QR code for uma string PIX copia e cola
      navigator.clipboard.writeText(selectedAgendamento.qrcode_pagamento)
      setPixCopiado(true)
      setTimeout(() => setPixCopiado(false), 3000)
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie suas consultas agendadas</p>
        </div>
        <Button onClick={() => navigate('/cliente/solicitar-agendamento')}>
          + Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-4">
        {agendamentos && agendamentos.length > 0 ? (
          agendamentos.map((agendamento: any) => (
            <Card key={agendamento.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agendamento.especialidade?.nome || 'Especialidade'}
                    </h3>
                    <Badge variant={getStatusVariant(agendamento.status)}>
                      {getStatusLabel(agendamento.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {agendamento.estabelecimento && (
                      <>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{agendamento.estabelecimento.nome}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="opacity-0" />
                          <span className="text-gray-500">
                            {agendamento.estabelecimento.endereco} - {agendamento.estabelecimento.cidade}
                          </span>
                        </div>
                      </>
                    )}
                    {agendamento.data_agendamento ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{formatDate(agendamento.data_agendamento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>
                            {new Date(agendamento.data_agendamento).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="text-warning-600">Aguardando confirmação de data</span>
                      </div>
                    )}

                    {/* STATUS DE PAGAMENTO */}
                    {!agendamento.pago && agendamento.status !== 'cancelado' && (
                      <div className="flex items-center gap-2 mt-3">
                        <DollarSign size={16} className="text-warning-600" />
                        <span className="text-warning-600 font-semibold">
                          Pagamento Pendente
                        </span>
                      </div>
                    )}
                    {agendamento.pago && (
                      <div className="flex items-center gap-2 mt-3">
                        <CheckCircle size={16} className="text-success-600" />
                        <span className="text-success-600 font-semibold">
                          Pagamento Confirmado
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Coparticipação</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(agendamento.valor_coparticipacao)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {agendamento.status === 'pendente' && (
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => handleCancelar(agendamento.id)}
                        isLoading={cancelarMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleVerDetalhes(agendamento)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2.5">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Você ainda não possui agendamentos. Clique no botão acima para solicitar um.
              </p>
              <Button onClick={() => navigate('/cliente/solicitar-agendamento')}>
                Solicitar Agendamento
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        title="Detalhes do Agendamento"
        size="lg"
      >
        {selectedAgendamento && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge variant={getStatusVariant(selectedAgendamento.status)} className="text-base">
                  {getStatusLabel(selectedAgendamento.status)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">ID do Agendamento</p>
                <p className="font-mono text-sm font-semibold">#{selectedAgendamento.id}</p>
              </div>
            </div>

            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Especialidade
                </label>
                <p className="text-gray-900">{selectedAgendamento.especialidade?.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Coparticipação
                </label>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(selectedAgendamento.valor_coparticipacao)}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Estabelecimento
                </label>
                <p className="text-gray-900">{selectedAgendamento.estabelecimento?.nome}</p>
                <p className="text-sm text-gray-600">
                  {selectedAgendamento.estabelecimento?.endereco} -{' '}
                  {selectedAgendamento.estabelecimento?.cidade}/{selectedAgendamento.estabelecimento?.estado}
                </p>
              </div>

              {selectedAgendamento.data_agendamento && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Data</label>
                    <p className="text-gray-900">{formatDate(selectedAgendamento.data_agendamento)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Horário</label>
                    <p className="text-gray-900">
                      {new Date(selectedAgendamento.data_agendamento).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Data da Solicitação
                </label>
                <p className="text-gray-900">{formatDate(selectedAgendamento.data_solicitacao)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Situação do Pagamento
                </label>
                {selectedAgendamento.pago ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-success-600" />
                    <span className="text-success-600 font-semibold">Confirmado</span>
                    {selectedAgendamento.data_pagamento && (
                      <span className="text-sm text-gray-600">
                        em {formatDate(selectedAgendamento.data_pagamento)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-warning-600 font-semibold flex items-center gap-2">
                    <DollarSign size={18} />
                    Pendente
                  </span>
                )}
              </div>
            </div>

            {/* QR CODE E LINK DE PAGAMENTO */}
            {!selectedAgendamento.pago && selectedAgendamento.status !== 'cancelado' && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">💳 Opções de Pagamento</h3>

                {/* QR Code PIX */}
                {selectedAgendamento.qrcode_pagamento && (
                  <div className="mb-4">
                    {selectedAgendamento.qrcode_pagamento.startsWith('data:image') ? (
                      // QR Code é uma imagem
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Escaneie o QR Code PIX:
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                          <img
                            src={selectedAgendamento.qrcode_pagamento}
                            alt="QR Code PIX"
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                      </div>
                    ) : (
                      // QR Code é PIX copia e cola
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">PIX Copia e Cola:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={selectedAgendamento.qrcode_pagamento}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 font-mono text-xs"
                          />
                          <Button onClick={copiarPixCopiaECola} size="sm">
                            {pixCopiado ? (
                              <>
                                <CheckCircle size={16} /> Copiado!
                              </>
                            ) : (
                              <>
                                <Copy size={16} /> Copiar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Link de Pagamento */}
                {selectedAgendamento.link_pagamento && (
                  <div className="mb-4">
                    <Button
                      onClick={() => window.open(selectedAgendamento.link_pagamento, '_blank')}
                      fullWidth
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Ir para Página de Pagamento
                    </Button>
                  </div>
                )}

                {/* Botão Informar Pagamento */}
                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleInformarPagamento(selectedAgendamento.id)}
                    variant="outline"
                    fullWidth
                    isLoading={informarPagamentoMutation.isPending}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Já Fiz o Pagamento
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Clique aqui após realizar o pagamento. Nossa equipe irá verificar e confirmar.
                  </p>
                </div>
              </div>
            )}

            {/* Observações */}
            {selectedAgendamento.observacoes && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedAgendamento.observacoes}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedAgendamento.status === 'pendente' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowDetalhesModal(false)
                    handleCancelar(selectedAgendamento.id)
                  }}
                  fullWidth
                >
                  Cancelar Agendamento
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowDetalhesModal(false)} fullWidth>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}