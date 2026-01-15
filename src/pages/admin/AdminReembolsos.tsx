import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
  Receipt,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Filter,
  X,
  Calendar,
  User
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { Link } from 'react-router-dom'

export const AdminReembolsos = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReembolso, setSelectedReembolso] = useState<any>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [showFiltros, setShowFiltros] = useState(false)

  // Filtros
  const [filtros, setFiltros] = useState({
    status: 'todos',
    tipo: 'todos',
    dataInicio: '',
    dataFim: '',
  })

  // Buscar todos os reembolsos
  const { data: reembolsosData, isLoading } = useQuery({
    queryKey: ['admin-reembolsos', searchTerm, filtros],
    queryFn: async () => {
      const { data, error } = await ApiService.supabase
        .from('reembolsos')
        .select(`
          *,
          cliente:clientes(
            id,
            cpf,
            cidade,
            estado,
            usuario:usuarios(id, nome, email, telefone)
          ),
          especialidade:especialidades(id, nome)
        `)
        .order('data_solicitacao', { ascending: false })

      if (error) throw error

      let resultado = data || []

      // Filtros
      if (filtros.status !== 'todos') {
        resultado = resultado.filter(r => r.status === filtros.status)
      }

      if (filtros.tipo !== 'todos') {
        resultado = resultado.filter(r => r.tipo === filtros.tipo)
      }

      if (filtros.dataInicio) {
        resultado = resultado.filter(r =>
          new Date(r.data_solicitacao) >= new Date(filtros.dataInicio)
        )
      }

      if (filtros.dataFim) {
        resultado = resultado.filter(r =>
          new Date(r.data_solicitacao) <= new Date(filtros.dataFim)
        )
      }

      // Busca por texto
      if (searchTerm) {
        resultado = resultado.filter(r =>
          r.cliente?.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.cliente?.cpf?.includes(searchTerm) ||
          r.id.toString().includes(searchTerm)
        )
      }

      return resultado
    },
  })

  const reembolsos = reembolsosData || []

  // Estatísticas
  const stats = {
    total: reembolsos.length,
    pendentes: reembolsos.filter(r => r.status === 'pendente' || r.status === 'em_analise').length,
    aprovados: reembolsos.filter(r => r.status === 'aprovado').length,
    pagos: reembolsos.filter(r => r.status === 'pago').length,
    reprovados: reembolsos.filter(r => r.status === 'reprovado').length,
    valorTotal: reembolsos.reduce((sum, r) => sum + (r.valor_total || 0), 0),
    valorAprovado: reembolsos
      .filter(r => r.status === 'aprovado' || r.status === 'pago')
      .reduce((sum, r) => sum + (r.valor_aprovado || 0), 0),
    valorPago: reembolsos
      .filter(r => r.status === 'pago')
      .reduce((sum, r) => sum + (r.valor_aprovado || 0), 0),
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      consulta: 'Consulta',
      exame: 'Exame',
      procedimento: 'Procedimento',
      medicamento: 'Medicamento',
    }
    return labels[tipo] || tipo
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      pendente: { label: 'Pendente', variant: 'warning' },
      em_analise: { label: 'Em Análise', variant: 'info' },
      aprovado: { label: 'Aprovado', variant: 'success' },
      reprovado: { label: 'Reprovado', variant: 'danger' },
      pago: { label: 'Pago', variant: 'success' },
      cancelado: { label: 'Cancelado', variant: 'neutral' },
    }
    const { label, variant } = config[status] || { label: status, variant: 'neutral' }
    return <Badge variant={variant}>{label}</Badge>
  }

  const limparFiltros = () => {
    setFiltros({
      status: 'todos',
      tipo: 'todos',
      dataInicio: '',
      dataFim: '',
    })
  }

  const exportarCSV = () => {
    if (!reembolsos || reembolsos.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }

    const headers = [
      'ID',
      'Cliente',
      'CPF',
      'Tipo',
      'Status',
      'Valor Solicitado',
      'Valor Estimado de Reembolso',
      'Valor Aprovado',
      'Data Solicitação',
      'Data Aprovação',
      'PIX',
    ]

    const rows = reembolsos.map(r => [
      r.id,
      r.cliente?.usuario?.nome || '',
      r.cliente?.cpf || '',
      getTipoLabel(r.tipo),
      r.status,
      r.valor_total || 0,
      r.valor_aprovado || 0,
      formatDate(r.data_solicitacao),
      r.data_aprovacao ? formatDate(r.data_aprovacao) : '',
      r.chave_pix || '',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reembolsos_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Reembolsos</h1>
          <p className="text-gray-600">Visualização completa e relatórios</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/reembolsos-pendentes">
            <Button variant="outline">
              <Clock size={16} className="mr-1" />
              Pendentes
            </Button>
          </Link>
          <Button variant="outline" onClick={exportarCSV}>
            <Download size={16} className="mr-1" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <FileText size={24} className="mx-auto mb-2 text-primary" />
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <Clock size={24} className="mx-auto mb-2 text-warning" />
            <p className="text-sm text-gray-600">Pendentes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <CheckCircle size={24} className="mx-auto mb-2 text-success" />
            <p className="text-sm text-gray-600">Aprovados</p>
            <p className="text-2xl font-bold text-gray-900">{stats.aprovados}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <DollarSign size={24} className="mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-600">Pagos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pagos}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <XCircle size={24} className="mx-auto mb-2 text-danger" />
            <p className="text-sm text-gray-600">Reprovados</p>
            <p className="text-2xl font-bold text-gray-900">{stats.reprovados}</p>
          </div>
        </Card>

        <Card className="p-4 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Total Solicitado</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.valorTotal)}</p>
          </div>
        </Card>

        <Card className="p-4 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="text-center">
            <DollarSign size={24} className="mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-600">Total Aprovado</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(stats.valorAprovado)}</p>
          </div>
        </Card>

        <Card className="p-4 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="text-center">
            <Receipt size={24} className="mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-gray-600">Total Pago</p>
            <p className="text-xl font-bold text-purple-700">{formatCurrency(stats.valorPago)}</p>
          </div>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFiltros(!showFiltros)}>
            <Filter size={16} className="mr-1" />
            Filtros
            {(filtros.status !== 'todos' || filtros.tipo !== 'todos' || filtros.dataInicio || filtros.dataFim) && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                Ativos
              </span>
            )}
          </Button>
        </div>

        {/* Painel de Filtros */}
        {showFiltros && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="reprovado">Reprovado</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="todos">Todos</option>
                  <option value="consulta">Consulta</option>
                  <option value="exame">Exame</option>
                  <option value="procedimento">Procedimento</option>
                  <option value="medicamento">Medicamento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Solicitado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Estimado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Aprovado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reembolsos.length > 0 ? (
                reembolsos.map((reembolso: any) => (
                  <tr key={reembolso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{reembolso.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reembolso.cliente?.usuario?.nome || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">{reembolso.cliente?.cpf}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTipoLabel(reembolso.tipo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reembolso.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(reembolso.valor_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reembolso.valor_estimado ? formatCurrency(reembolso.valor_estimado) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reembolso.valor_aprovado ? formatCurrency(reembolso.valor_aprovado) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reembolso.data_solicitacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReembolso(reembolso)
                          setShowDetalhesModal(true)
                        }}
                      >
                        <Eye size={14} className="mr-1" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Nenhum reembolso encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        title="Detalhes do Reembolso"
        size="lg"
      >
        {selectedReembolso && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                {getStatusBadge(selectedReembolso.status)}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">ID</p>
                <p className="font-mono text-sm font-semibold">#{selectedReembolso.id}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Cliente</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Nome</p>
                  <p className="font-medium">{selectedReembolso.cliente?.usuario?.nome}</p>
                </div>
                <div>
                  <p className="text-gray-600">CPF</p>
                  <p className="font-medium">{selectedReembolso.cliente?.cpf}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Valores</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Solicitado</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedReembolso.valor_total)}</p>
                </div>
                {selectedReembolso.valor_aprovado && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Aprovado</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(selectedReembolso.valor_aprovado)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedReembolso.chave_pix && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">PIX</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Tipo: {selectedReembolso.tipo_pix}</p>
                  <p className="font-mono font-semibold">{selectedReembolso.chave_pix}</p>
                </div>
              </div>
            )}

            {selectedReembolso.motivo_reprovacao && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Motivo da Reprovação</h4>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">{selectedReembolso.motivo_reprovacao}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}