import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
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
  AlertCircle,
  Calendar,
  MapPin,
  User
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { Link } from 'react-router-dom'

export const AdminReembolsos = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReembolso, setSelectedReembolso] = useState<any>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [showModalAprovar, setShowModalAprovar] = useState(false)
  const [showModalRejeitar, setShowModalRejeitar] = useState(false)
  const [motivoRejeicao, setMotivoRejeicao] = useState('')

  // Filtros
  const [filtros, setFiltros] = useState({
    status: 'todos',
    tipo: 'todos',
    especialidade: 'todas',
    cidade: 'todas',
    estado: 'todos',
    dataInicio: '',
    dataFim: '',
    periodoRapido: 'mensal'
  })

  // Buscar todos os reembolsos
  const { data: reembolsos, isLoading } = useQuery({
    queryKey: ['reembolsos', searchTerm, filtros],
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
          )
        `)
        .order('data_solicitacao', { ascending: false })

      if (error) throw error

      let resultado = data || []

      // Aplicar filtros
      if (filtros.status !== 'todos') {
        resultado = resultado.filter(r => r.status === filtros.status)
      }

      if (filtros.tipo !== 'todos') {
        resultado = resultado.filter(r => r.tipo === filtros.tipo)
      }

      if (filtros.especialidade !== 'todas') {
        resultado = resultado.filter(r => r.especialidade === filtros.especialidade)
      }

      if (filtros.cidade !== 'todas') {
        resultado = resultado.filter(r => r.cliente?.cidade === filtros.cidade)
      }

      if (filtros.estado !== 'todos') {
        resultado = resultado.filter(r => r.cliente?.estado === filtros.estado)
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
          r.protocolo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      return resultado
    },
  })

  // Stats
  const totalReembolsado = reembolsos
    ?.filter(r => r.status === 'aprovado')
    .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0) || 0

  const consultas = reembolsos
    ?.filter(r => r.tipo === 'consulta' && r.status === 'aprovado')
    .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0) || 0

  const exames = reembolsos
    ?.filter(r => r.tipo === 'exame' && r.status === 'aprovado')
    .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0) || 0

  const ticketMedio = reembolsos && reembolsos.length > 0
    ? totalReembolsado / reembolsos.filter(r => r.status === 'aprovado').length
    : 0

  const stats = {
    totalReembolsado,
    consultas,
    exames,
    ticketMedio,
    pendentes: reembolsos?.filter(r => r.status === 'pendente').length || 0,
    aprovados: reembolsos?.filter(r => r.status === 'aprovado').length || 0,
    recusados: reembolsos?.filter(r => r.status === 'recusado').length || 0,
  }

  // Mutation para aprovar reembolso
  const aprovarMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await ApiService.supabase
        .from('reembolsos')
        .update({
          status: 'aprovado',
          data_aprovacao: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos'] })
      setShowModalAprovar(false)
      setShowDetalhesModal(false)
      alert('Reembolso aprovado com sucesso!')
    },
  })

  // Mutation para rejeitar reembolso
  const rejeitarMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      const { data, error } = await ApiService.supabase
        .from('reembolsos')
        .update({
          status: 'recusado',
          motivo_rejeicao: motivo,
          data_rejeicao: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos'] })
      setShowModalRejeitar(false)
      setShowDetalhesModal(false)
      setMotivoRejeicao('')
      alert('Reembolso rejeitado!')
    },
  })

  const handleVerDetalhes = (reembolso: any) => {
    setSelectedReembolso(reembolso)
    setShowDetalhesModal(true)
  }

  const handleAprovar = () => {
    if (selectedReembolso) {
      aprovarMutation.mutate(selectedReembolso.id)
    }
  }

  const handleRejeitar = () => {
    if (selectedReembolso && motivoRejeicao.trim()) {
      rejeitarMutation.mutate({
        id: selectedReembolso.id,
        motivo: motivoRejeicao
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string; icon: any }> = {
      pendente: { text: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} /> },
      aprovado: { text: 'Aprovado', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
      recusado: { text: 'Recusado', color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
    }
    const badge = badges[status] || badges.pendente
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    )
  }

  const limparFiltros = () => {
    setFiltros({
      status: 'todos',
      tipo: 'todos',
      especialidade: 'todas',
      cidade: 'todas',
      estado: 'todos',
      dataInicio: '',
      dataFim: '',
      periodoRapido: 'mensal'
    })
    setSearchTerm('')
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reembolsos</h1>
        <p className="text-gray-600 mt-1">Gerencie solicitações de reembolso</p>
      </div>

      {/* Filtros Avançados */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} className="text-primary" />
          Filtros de Reembolsos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período Rápido</label>
            <select
              value={filtros.periodoRapido}
              onChange={(e) => setFiltros({ ...filtros, periodoRapido: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="hoje">Hoje</option>
              <option value="mensal">Mensal</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              disabled={filtros.periodoRapido !== 'personalizado'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              disabled={filtros.periodoRapido !== 'personalizado'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="consulta">Consultas</option>
              <option value="exame">Exames</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
            <select
              value={filtros.especialidade}
              onChange={(e) => setFiltros({ ...filtros, especialidade: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todas">Todas</option>
              <option value="Cardiologia">Cardiologia</option>
              <option value="Ortopedia">Ortopedia</option>
              <option value="Dermatologia">Dermatologia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
            <select
              value={filtros.cidade}
              onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todas">Todas</option>
              <option value="São Paulo">São Paulo</option>
              <option value="Rio de Janeiro">Rio de Janeiro</option>
              <option value="Belo Horizonte">Belo Horizonte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="SP">SP</option>
              <option value="RJ">RJ</option>
              <option value="MG">MG</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="recusado">Rejeitado</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={limparFiltros}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
          >
            <X size={18} />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Análise de Reembolsos */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle size={18} />
          Análise de Reembolsos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-blue-800">
          <p><strong>Menor Valor (Consulta):</strong> R$ 120,00</p>
          <p><strong>Maior Valor (Consulta):</strong> R$ 850,00</p>
          <p><strong>Menor Valor (Exame):</strong> R$ 45,00</p>
          <p><strong>Maior Valor (Exame):</strong> R$ 420,00</p>
        </div>
      </div>

      {/* Tabela de Reembolsos */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Solicitações de Reembolso</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar reembolso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Protocolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Especialidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Cidade/UF
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reembolsos && reembolsos.length > 0 ? (
                reembolsos.map((reembolso: any) => (
                  <tr key={reembolso.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {reembolso.protocolo || `#REMB-${String(reembolso.id).padStart(4, '0')}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{reembolso.cliente?.usuario?.nome || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{reembolso.tipo || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {reembolso.especialidade || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(reembolso.data_solicitacao)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {reembolso.cliente?.cidade || 'N/A'}/{reembolso.cliente?.estado || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(reembolso.valor_solicitado)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(reembolso.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerDetalhes(reembolso)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Receipt size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhum reembolso encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhes */}
      {showDetalhesModal && selectedReembolso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Reembolso</h2>
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Cliente */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  Cliente
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p><strong>Nome:</strong> {selectedReembolso.cliente?.usuario?.nome}</p>
                  <p><strong>CPF:</strong> {selectedReembolso.cliente?.cpf}</p>
                  <p><strong>Email:</strong> {selectedReembolso.cliente?.usuario?.email}</p>
                  <p><strong>Telefone:</strong> {selectedReembolso.cliente?.usuario?.telefone || 'Não informado'}</p>
                  <p>
                    <strong>Localização:</strong> {selectedReembolso.cliente?.cidade}/{selectedReembolso.cliente?.estado}
                  </p>
                </div>
              </div>

              {/* Informações do Reembolso */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Receipt size={18} className="text-primary" />
                  Dados do Reembolso
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p><strong>Protocolo:</strong> {selectedReembolso.protocolo || `#REMB-${String(selectedReembolso.id).padStart(4, '0')}`}</p>
                  <p><strong>Tipo:</strong> <span className="capitalize">{selectedReembolso.tipo}</span></p>
                  <p><strong>Especialidade:</strong> {selectedReembolso.especialidade || 'N/A'}</p>
                  <p><strong>Data da Solicitação:</strong> {formatDate(selectedReembolso.data_solicitacao)}</p>
                  <p><strong>Valor Solicitado:</strong> {formatCurrency(selectedReembolso.valor_solicitado)}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedReembolso.status)}</p>
                  {selectedReembolso.descricao && (
                    <p><strong>Descrição:</strong> {selectedReembolso.descricao}</p>
                  )}
                  {selectedReembolso.motivo_rejeicao && (
                    <p><strong>Motivo da Rejeição:</strong> {selectedReembolso.motivo_rejeicao}</p>
                  )}
                </div>
              </div>

              {/* Ações */}
              {selectedReembolso.status === 'pendente' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowModalAprovar(true)}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Aprovar Reembolso
                  </button>
                  <button
                    onClick={() => setShowModalRejeitar(true)}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Aprovar */}
      {showModalAprovar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Aprovação</h2>
            <p className="text-gray-700 mb-6">
              Deseja realmente aprovar este reembolso no valor de{' '}
              <strong>{formatCurrency(selectedReembolso?.valor_solicitado || 0)}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModalAprovar(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAprovar}
                disabled={aprovarMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50"
              >
                {aprovarMutation.isPending ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejeitar */}
      {showModalRejeitar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rejeitar Reembolso</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da Rejeição *
              </label>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Explique o motivo da rejeição..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModalRejeitar(false)
                  setMotivoRejeicao('')
                }}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejeitar}
                disabled={!motivoRejeicao.trim() || rejeitarMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50"
              >
                {rejeitarMutation.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}