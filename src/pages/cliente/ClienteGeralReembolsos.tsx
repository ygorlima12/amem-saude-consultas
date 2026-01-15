import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Eye
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'
import { useNavigate } from 'react-router-dom'

export const ClienteReembolsosHistorico = () => {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedReembolso, setSelectedReembolso] = useState<any>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  // Buscar reembolsos do cliente
  const { data: reembolsos, isLoading } = useQuery({
    queryKey: ['reembolsos', cliente?.id],
    queryFn: () => ApiService.getReembolsos(cliente!.id),
    enabled: !!cliente?.id,
  })

  // Mutation para cancelar reembolso
  const cancelarMutation = useMutation({
    mutationFn: (reembolsoId: number) => ApiService.cancelarReembolso(reembolsoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos'] })
      alert('Solicitação de reembolso cancelada com sucesso!')
      setShowDetalhesModal(false)
    },
  })

  // Obter variante do badge por status
  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'warning',
      em_analise: 'info',
      aprovado: 'success',
      reprovado: 'danger',
      pago: 'success',
      cancelado: 'neutral',
    }
    return variants[status] || 'neutral'
  }

  // Obter label do status
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      em_analise: 'Em Análise',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado',
      pago: 'Pago',
      cancelado: 'Cancelado',
    }
    return labels[status] || status
  }

  // Obter label do tipo
  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      consulta: 'Consulta',
      exame: 'Exame',
      procedimento: 'Procedimento',
      medicamento: 'Medicamento',
      outro: 'Outro',
    }
    return labels[tipo] || tipo
  }

  // Handler para cancelar
  const handleCancelar = (reembolsoId: number) => {
    if (confirm('Tem certeza que deseja cancelar esta solicitação de reembolso?')) {
      cancelarMutation.mutate(reembolsoId)
    }
  }

  // Handler para ver detalhes
  const handleVerDetalhes = (reembolso: any) => {
    setSelectedReembolso(reembolso)
    setShowDetalhesModal(true)
  }

  // Filtrar reembolsos
  const reembolsosFiltrados = reembolsos?.filter((reembolso: any) => {
    if (filtroStatus === 'todos') return true
    return reembolso.status === filtroStatus
  })

  // Estatísticas rápidas
  const stats = {
    total: reembolsos?.length || 0,
    pendentes: reembolsos?.filter((r: any) => r.status === 'pendente' || r.status === 'em_analise').length || 0,
    aprovados: reembolsos?.filter((r: any) => r.status === 'aprovado' || r.status === 'pago').length || 0,
    valorTotal: reembolsos?.reduce((sum: number, r: any) => sum + (r.valor_estimado || 0), 0) || 0,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando reembolsos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Reembolsos</h1>
          <p className="text-gray-600">Gerencie suas solicitações de reembolso</p>
        </div>
        <Button onClick={() => navigate('/cliente/reembolsos')}>
          + Solicitar Reembolso
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Clock className="text-warning" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Em Análise</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="text-success" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aprovados}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.valorTotal)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filtroStatus === 'todos' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('todos')}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={filtroStatus === 'pendente' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('pendente')}
          >
            Pendentes
          </Button>
          <Button
            size="sm"
            variant={filtroStatus === 'em_analise' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('em_analise')}
          >
            Em Análise
          </Button>
          <Button
            size="sm"
            variant={filtroStatus === 'aprovado' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('aprovado')}
          >
            Aprovados
          </Button>
          <Button
            size="sm"
            variant={filtroStatus === 'reprovado' ? 'primary' : 'outline'}
            onClick={() => setFiltroStatus('reprovado')}
          >
            Reprovados
          </Button>
        </div>
      </Card>

      {/* Lista de Reembolsos */}
      <div className="grid gap-4">
        {reembolsosFiltrados && reembolsosFiltrados.length > 0 ? (
          reembolsosFiltrados.map((reembolso: any) => (
            <Card key={reembolso.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getTipoLabel(reembolso.tipo)}
                    </h3>
                    <Badge variant={getStatusVariant(reembolso.status)}>
                      {getStatusLabel(reembolso.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Solicitado em: {formatDate(reembolso.data_solicitacao)}</span>
                    </div>

                    {reembolso.data_atendimento && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Data do atendimento: {formatDate(reembolso.data_atendimento)}</span>
                      </div>
                    )}

                    {reembolso.estabelecimento_nome && (
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span>{reembolso.estabelecimento_nome}</span>
                      </div>
                    )}

                    {reembolso.observacoes && (
                      <div className="mt-2">
                        <p className="text-gray-500 text-xs">
                          {reembolso.observacoes.substring(0, 100)}
                          {reembolso.observacoes.length > 100 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Valor Solicitado</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reembolso.valor_estimado)}
                    </p>
                    {reembolso.valor_aprovado && reembolso.valor_aprovado !== reembolso.valor_estimado && (
                      <p className="text-sm text-success-600 font-semibold mt-1">
                        Aprovado: {formatCurrency(reembolso.valor_aprovado)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {(reembolso.status === 'pendente' || reembolso.status === 'em_analise') && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancelar(reembolso.id)}
                        isLoading={cancelarMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerDetalhes(reembolso)}
                    >
                      <Eye size={16} className="mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2.5">
                Nenhum reembolso encontrado
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                {filtroStatus === 'todos' 
                  ? 'Você ainda não possui solicitações de reembolso.' 
                  : `Você não possui reembolsos com status "${getStatusLabel(filtroStatus)}".`}
              </p>
              <Button onClick={() => navigate('/cliente/reembolsos')}>
                Solicitar Reembolso
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        title="Detalhes do Reembolso"
        size="lg"
      >
        {selectedReembolso && (
          <div className="space-y-6">
            {/* Status e ID */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge variant={getStatusVariant(selectedReembolso.status)} className="text-base">
                  {getStatusLabel(selectedReembolso.status)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">ID do Reembolso</p>
                <p className="font-mono text-sm font-semibold">#{selectedReembolso.id}</p>
              </div>
            </div>

            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tipo de Reembolso
                </label>
                <p className="text-gray-900">{getTipoLabel(selectedReembolso.tipo)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Data da Solicitação
                </label>
                <p className="text-gray-900">{formatDate(selectedReembolso.data_solicitacao)}</p>
              </div>

              {selectedReembolso.data_atendimento && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Data do Atendimento
                  </label>
                  <p className="text-gray-900">{formatDate(selectedReembolso.data_atendimento)}</p>
                </div>
              )}

              {selectedReembolso.estabelecimento_nome && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Estabelecimento
                  </label>
                  <p className="text-gray-900">{selectedReembolso.estabelecimento_nome}</p>
                </div>
              )}
            </div>

            {/* Valores */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Valores</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor Solicitado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedReembolso.valor_total)}
                  </p>
                </div>

                {selectedReembolso.valor_aprovado && (
                  <div className="bg-success-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Valor Aprovado</p>
                    <p className="text-2xl font-bold text-success-700">
                      {formatCurrency(selectedReembolso.valor_aprovado)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            {selectedReembolso.observacoes && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observações
                </label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedReembolso.observacoes}
                </p>
              </div>
            )}

            {/* Motivo da Reprovação */}
            {selectedReembolso.status === 'reprovado' && selectedReembolso.motivo_reprovacao && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-red-800 mb-2">
                  Motivo da Reprovação
                </label>
                <p className="text-red-700">{selectedReembolso.motivo_reprovacao}</p>
              </div>
            )}

            {/* Documentos */}
            {(selectedReembolso.url_nota_fiscal || selectedReembolso.url_receita || selectedReembolso.url_relatorio) && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Documentos Anexados</h4>
                <div className="space-y-2">
                  {selectedReembolso.url_nota_fiscal && (
                    <a
                      href={selectedReembolso.url_nota_fiscal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Download size={16} />
                      <span>Nota Fiscal</span>
                    </a>
                  )}
                  {selectedReembolso.url_receita && (
                    <a
                      href={selectedReembolso.url_receita}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Download size={16} />
                      <span>Receita Médica</span>
                    </a>
                  )}
                  {selectedReembolso.url_relatorio && (
                    <a
                      href={selectedReembolso.url_relatorio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Download size={16} />
                      <span>Relatório Médico</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setShowDetalhesModal(false)} fullWidth>
                Fechar
              </Button>
              {(selectedReembolso.status === 'pendente' || selectedReembolso.status === 'em_analise') && (
                <Button
                  variant="danger"
                  onClick={() => handleCancelar(selectedReembolso.id)}
                  isLoading={cancelarMutation.isPending}
                  fullWidth
                >
                  Cancelar Solicitação
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}