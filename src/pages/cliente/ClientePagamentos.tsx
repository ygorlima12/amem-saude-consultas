import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Calendar, DollarSign, ExternalLink, Copy, CheckCircle, Info } from 'lucide-react'
import { formatDate, formatCurrency } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'

export const ClientePagamentos = () => {
  const { cliente } = useAuth()
  const queryClient = useQueryClient()
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [pixCopiado, setPixCopiado] = useState(false)

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos', cliente?.id],
    queryFn: () => ApiService.getAgendamentos(cliente!.id),
    enabled: !!cliente?.id,
  })

  const informarPagamentoMutation = useMutation({
    mutationFn: (agendamentoId: number) => ApiService.informarPagamento(agendamentoId),
    onSuccess: () => {
      alert('Pagamento informado! Nossa equipe irá verificar e confirmar em breve.')
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      setShowDetalhesModal(false)
    },
  })

  // Calcular totais
  const totalPago = agendamentos
    ?.filter((a: any) => a.pago)
    .reduce((sum: number, a: any) => sum + a.valor_coparticipacao, 0) || 0

  const totalPendente = agendamentos
    ?.filter((a: any) => !a.pago && a.status !== 'cancelado')
    .reduce((sum: number, a: any) => sum + a.valor_coparticipacao, 0) || 0

  // Total do mês atual
  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()
  const totalMes = agendamentos
    ?.filter((a: any) => {
      const data = new Date(a.data_solicitacao)
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual && a.pago
    })
    .reduce((sum: number, a: any) => sum + a.valor_coparticipacao, 0) || 0

  const handleVerDetalhes = (agendamento: any) => {
    setSelectedPagamento(agendamento)
    setShowDetalhesModal(true)
    setPixCopiado(false)
  }

  const handleInformarPagamento = (agendamentoId: number) => {
    if (confirm('Você confirma que realizou o pagamento? Nossa equipe irá verificar.')) {
      informarPagamentoMutation.mutate(agendamentoId)
    }
  }

  const copiarPixCopiaECola = () => {
    if (selectedPagamento?.qrcode_pagamento) {
      navigator.clipboard.writeText(selectedPagamento.qrcode_pagamento)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coparticipação</h1>
        <p className="text-gray-600">Gerencie seus pagamentos de coparticipação</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Pago</p>
            <p className="text-3xl font-bold text-success-600">{formatCurrency(totalPago)}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Pendente</p>
            <p className="text-3xl font-bold text-warning-600">{formatCurrency(totalPendente)}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Este Mês</p>
            <p className="text-3xl font-bold text-primary-600">{formatCurrency(totalMes)}</p>
          </div>
        </Card>
      </div>

      {/* Info sobre Coparticipação */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Sobre a Coparticipação</h3>
            <p className="text-sm text-blue-800">
              • Valor fixo de <strong>R$ 25,00</strong> por consulta
              <br />
              • Limite máximo de <strong>R$ 400,00</strong> por mês
              <br />• Pagamento via PIX para agilizar seu atendimento
            </p>
          </div>
        </div>
      </Card>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardTitle>Histórico de Pagamentos</CardTitle>

        {agendamentos && agendamentos.length > 0 ? (
          <div className="space-y-3">
            {agendamentos.map((agendamento: any) => (
              <div
                key={agendamento.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {agendamento.especialidade?.nome || 'Especialidade'}
                    </h4>
                    {agendamento.pago ? (
                      <Badge variant="success">
                        <CheckCircle size={14} /> Pago
                      </Badge>
                    ) : agendamento.status === 'cancelado' ? (
                      <Badge variant="neutral">Cancelado</Badge>
                    ) : (
                      <Badge variant="warning">
                        <DollarSign size={14} /> Pendente
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(agendamento.data_solicitacao)}</span>
                    </div>
                    {agendamento.estabelecimento && (
                      <span className="text-gray-500">
                        {agendamento.estabelecimento.nome}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(agendamento.valor_coparticipacao)}
                    </p>
                    {agendamento.data_pagamento && (
                      <p className="text-xs text-gray-500">
                        Pago em {formatDate(agendamento.data_pagamento)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!agendamento.pago && agendamento.status !== 'cancelado' && (
                      <>
                        {agendamento.link_pagamento && (
                          <Button
                            size="sm"
                            onClick={() => window.open(agendamento.link_pagamento, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink size={14} />
                            Pagar
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerDetalhes(agendamento)}
                    >
                      Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2.5">
              Nenhum pagamento encontrado
            </h3>
            <p className="text-sm text-text-secondary">
              Você ainda não possui pagamentos registrados.
            </p>
          </div>
        )}
      </Card>

      {/* Modal de Detalhes do Pagamento */}
      <Modal
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        title="Detalhes do Pagamento"
        size="lg"
      >
        {selectedPagamento && (
          <div className="space-y-6">
            {/* Status do Pagamento */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status do Pagamento</p>
                {selectedPagamento.pago ? (
                  <Badge variant="success" className="text-base">
                    <CheckCircle size={16} /> Confirmado
                  </Badge>
                ) : selectedPagamento.status === 'cancelado' ? (
                  <Badge variant="neutral" className="text-base">
                    Cancelado
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-base">
                    <DollarSign size={16} /> Pendente
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">ID do Agendamento</p>
                <p className="font-mono text-sm font-semibold">#{selectedPagamento.id}</p>
              </div>
            </div>

            {/* Informações do Agendamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Especialidade
                </label>
                <p className="text-gray-900">{selectedPagamento.especialidade?.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Valor da Coparticipação
                </label>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(selectedPagamento.valor_coparticipacao)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Data da Solicitação
                </label>
                <p className="text-gray-900">{formatDate(selectedPagamento.data_solicitacao)}</p>
              </div>

              {selectedPagamento.data_pagamento && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Data do Pagamento
                  </label>
                  <p className="text-gray-900">{formatDate(selectedPagamento.data_pagamento)}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Estabelecimento
                </label>
                <p className="text-gray-900">{selectedPagamento.estabelecimento?.nome}</p>
                <p className="text-sm text-gray-600">
                  {selectedPagamento.estabelecimento?.endereco} -{' '}
                  {selectedPagamento.estabelecimento?.cidade}/{selectedPagamento.estabelecimento?.estado}
                </p>
              </div>
            </div>

            {/* SEÇÃO DE PAGAMENTO */}
            {!selectedPagamento.pago && selectedPagamento.status !== 'cancelado' && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  💳 Opções de Pagamento
                </h3>

                {/* QR Code PIX */}
                {selectedPagamento.qrcode_pagamento && (
                  <div className="mb-4">
                    {selectedPagamento.qrcode_pagamento.startsWith('data:image') ? (
                      // QR Code é uma imagem
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Escaneie o QR Code PIX:
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                          <img
                            src={selectedPagamento.qrcode_pagamento}
                            alt="QR Code PIX"
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                      </div>
                    ) : (
                      // QR Code é PIX copia e cola
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          PIX Copia e Cola:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={selectedPagamento.qrcode_pagamento}
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
                {selectedPagamento.link_pagamento && (
                  <div className="mb-4">
                    <Button
                      onClick={() => window.open(selectedPagamento.link_pagamento, '_blank')}
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
                    onClick={() => handleInformarPagamento(selectedPagamento.id)}
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

            {/* Pagamento Confirmado */}
            {selectedPagamento.pago && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-success-600" />
                  <div>
                    <p className="font-semibold text-success-900">Pagamento Confirmado</p>
                    <p className="text-sm text-success-700">
                      O pagamento foi confirmado em{' '}
                      {formatDate(selectedPagamento.data_pagamento || selectedPagamento.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão Fechar */}
            <div className="flex gap-3 pt-4 border-t">
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