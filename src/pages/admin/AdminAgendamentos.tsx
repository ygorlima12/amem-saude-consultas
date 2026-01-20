import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Calendar, MapPin, User, DollarSign, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import { formatDate, formatCurrency, getStatusLabel } from '@/utils/format'
import { ApiService } from '@/services/api.service'

export const AdminAgendamentos = () => {
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  // Buscar todos os agendamentos
  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['todos-agendamentos'],
    queryFn: async () => {
      const response = await ApiService.getAllAgendamentos()
      return response
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })

  // ==================== CORREÇÃO: APLICAR FILTRO ====================
  const agendamentosFiltrados = useMemo(() => {
    if (!agendamentos) return []
    
    if (filtroStatus === 'todos') {
      return agendamentos
    }
    
    return agendamentos.filter((a: any) => a.status === filtroStatus)
  }, [agendamentos, filtroStatus])

  // Calcular estatísticas
  const hoje = new Date().toISOString().split('T')[0]
  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()

  const stats = {
    hoje: agendamentos?.filter((a: any) => 
      a.data_agendamento?.startsWith(hoje)
    ).length || 0,
    pendentes: agendamentos?.filter((a: any) => a.status === 'pendente').length || 0,
    confirmados: agendamentos?.filter((a: any) => a.status === 'confirmado').length || 0,
    esteMes: agendamentos?.filter((a: any) => {
      const data = new Date(a.data_solicitacao)
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
    }).length || 0,
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'warning',
      confirmado: 'success',
      realizado: 'info',
      cancelado: 'danger',
    }
    return variants[status] || 'neutral'
  }

  const handleVerDetalhes = (agendamento: any) => {
    setSelectedAgendamento(agendamento)
    setShowDetalhesModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie os agendamentos de consultas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Plus size={24} className="text-primary-600" />
            </div>
            <div>
            <p className="text-sm text-gray-600 mb-1">Hoje</p>
            <p className="text-3xl font-bold">{stats.hoje}</p>
          </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
            <p className="text-sm text-gray-600 mb-1">Pendentes</p>
            <p className="text-3xl font-bold">{stats.pendentes}</p>
          </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
            <p className="text-sm text-gray-600 mb-1">Confirmados</p>
            <p className="text-3xl font-bold">{stats.confirmados}</p>
          </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-yellow-600" size={24} />
            </div>
            <div>
            <p className="text-sm text-gray-600 mb-1">Este Mês</p>
            <p className="text-3xl font-bold">{stats.esteMes}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filtroStatus === 'todos' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('todos')}
          >
            Todos ({agendamentos?.length || 0})
          </Button>
          <Button
            size="sm"
            variant={filtroStatus === 'pendente' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('pendente')}
          >
            Pendentes ({stats.pendentes})
          </Button>
          <Button
            size="sm"
            variant={filtroStatus === 'confirmado' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('confirmado')}
          >
            Confirmados ({stats.confirmados})
          </Button>
          <Button
            size="sm"
            variant={filtroStatus === 'realizado' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('realizado')}
          >
            Realizados ({agendamentos?.filter((a: any) => a.status === 'realizado').length || 0})
          </Button>
          <Button
            size="sm"
            variant={filtroStatus === 'cancelado' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('cancelado')}
          >
            Cancelados ({agendamentos?.filter((a: any) => a.status === 'cancelado').length || 0})
          </Button>
        </div>
      </Card>

      {/* Lista de Agendamentos - USANDO agendamentosFiltrados */}
      <div className="space-y-4">
        {agendamentosFiltrados && agendamentosFiltrados.length > 0 ? (
          agendamentosFiltrados.map((agendamento: any) => (
            <Card key={agendamento.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agendamento.especialidade?.nome}
                    </h3>
                    <Badge variant={getStatusVariant(agendamento.status)}>
                      {getStatusLabel(agendamento.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-600" />
                        <span>{agendamento.cliente?.usuario?.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-600" />
                        <span>{agendamento.estabelecimento?.nome}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {agendamento.status === 'cancelado' ? (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle size={14} />
                          <span>Agendamento Cancelado</span>
                        </div>
                      ) : agendamento.status === 'confirmado' ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={14} />
                          <span>Atendimento Confirmado</span>
                        </div>
                      ) : agendamento.data_agendamento ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-600" />
                            <span>{formatDate(agendamento.data_agendamento)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-600" />
                            <span>
                              {new Date(agendamento.data_agendamento).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </>
                      ) : agendamento.status === 'pendente' ? (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Clock size={14} />
                          <span>Aguardando confirmação</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Coparticipação</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(agendamento.valor_coparticipacao)}
                    </p>
                    {agendamento.pago ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                        <CheckCircle size={14} />
                        <span>Pago</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600 text-sm mt-1">
                        <DollarSign size={14} />
                        <span>Pendente</span>
                      </div>
                    )}
                  </div>

                  <Button size="sm" variant="outline" onClick={() => handleVerDetalhes(agendamento)}>
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600">
                {filtroStatus === 'todos'
                  ? 'Ainda não há agendamentos no sistema'
                  : `Nenhum agendamento com status "${getStatusLabel(filtroStatus)}"`}
              </p>
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
                <p className="text-sm text-gray-600 mb-1">ID</p>
                <p className="font-mono text-sm font-semibold">#{selectedAgendamento.id}</p>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">👤 Cliente</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p>
                  <strong>Nome:</strong> {selectedAgendamento.cliente?.usuario?.nome}
                </p>
                <p>
                  <strong>Email:</strong> {selectedAgendamento.cliente?.usuario?.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {selectedAgendamento.cliente?.telefone || 'N/A'}
                </p>
                <p>
                  <strong>CPF:</strong> {selectedAgendamento.cliente?.cpf || 'N/A'}
                </p>
              </div>
            </div>

            {/* Dados do Agendamento */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📋 Agendamento</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p>
                  <strong>Especialidade:</strong> {selectedAgendamento.especialidade?.nome}
                </p>
                <p>
                  <strong>Estabelecimento:</strong> {selectedAgendamento.estabelecimento?.nome}
                </p>
                <p>
                  <strong>Endereço:</strong> {selectedAgendamento.estabelecimento?.endereco},{' '}
                  {selectedAgendamento.estabelecimento?.cidade}/
                  {selectedAgendamento.estabelecimento?.estado}
                </p>
                {selectedAgendamento.data_agendamento && (
                  <>
                    <p>
                      <strong>Data:</strong> {formatDate(selectedAgendamento.data_agendamento)}
                    </p>
                    <p>
                      <strong>Horário:</strong>{' '}
                      {new Date(selectedAgendamento.data_agendamento).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </>
                )}
                {selectedAgendamento.observacoes && (
                  <p>
                    <strong>Observações:</strong> {selectedAgendamento.observacoes}
                  </p>
                )}
              </div>
            </div>

            {/* Status de Pagamento */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">💳 Pagamento</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Confirmado pelo Sistema</p>
                    <p className="text-sm text-gray-600">
                      {selectedAgendamento.pago
                        ? `Pago em ${formatDate(selectedAgendamento.data_pagamento)}`
                        : 'Pagamento pendente'}
                    </p>
                  </div>
                  {selectedAgendamento.pago ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <DollarSign className="text-yellow-600" size={24} />
                  )}
                </div>

                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedAgendamento.valor_coparticipacao)}
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowDetalhesModal(false)} fullWidth>
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}