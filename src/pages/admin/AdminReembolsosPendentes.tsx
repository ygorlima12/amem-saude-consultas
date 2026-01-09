import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import {
  Receipt,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  User,
  FileText,
  X
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { Link } from 'react-router-dom'

export const AdminReembolsosPendentes = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReembolso, setSelectedReembolso] = useState<any>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [showModalAprovar, setShowModalAprovar] = useState(false)
  const [showModalRejeitar, setShowModalRejeitar] = useState(false)
  const [motivoRejeicao, setMotivoRejeicao] = useState('')

  // Buscar apenas reembolsos pendentes
  const { data: reembolsosPendentes, isLoading } = useQuery({
    queryKey: ['reembolsos-pendentes', searchTerm],
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
            telefone,
            usuario:usuarios(id, nome, email, telefone)
          )
        `)
        .eq('status', 'pendente')
        .order('data_solicitacao', { ascending: false })

      if (error) throw error

      let resultado = data || []

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

  // Stats apenas dos pendentes
  const stats = {
    total: reembolsosPendentes?.length || 0,
    valorTotal: reembolsosPendentes?.reduce((sum, r) => sum + (r.valor_solicitado || 0), 0) || 0,
    consultas: reembolsosPendentes?.filter(r => r.tipo === 'consulta').length || 0,
    exames: reembolsosPendentes?.filter(r => r.tipo === 'exame').length || 0,
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
      queryClient.invalidateQueries({ queryKey: ['reembolsos-pendentes'] })
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
      queryClient.invalidateQueries({ queryKey: ['reembolsos-pendentes'] })
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
        <h1 className="text-2xl font-bold text-gray-900">Reembolsos Pendentes</h1>
        <p className="text-gray-600 mt-1">Solicitações aguardando análise e aprovação</p>
      </div>

      {/* Alerta de Pendentes */}
      {stats.total > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Atenção!</h4>
            <p className="text-sm text-yellow-800">
              Você tem <strong>{stats.total} reembolsos pendentes</strong> aguardando análise no valor total de{' '}
              <strong>{formatCurrency(stats.valorTotal)}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Pendente</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Valor Total</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.valorTotal)}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Consultas</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.consultas}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Exames</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.exames}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Reembolsos Pendentes */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Reembolsos Aguardando Análise</h2>
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
            <Link
              to="/admin/reembolsos"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Ver Todos
            </Link>
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
                  Data Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reembolsosPendentes && reembolsosPendentes.length > 0 ? (
                reembolsosPendentes.map((reembolso: any) => (
                  <tr key={reembolso.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {reembolso.protocolo || `#REMB-${String(reembolso.id).padStart(4, '0')}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{reembolso.cliente?.usuario?.nome || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{reembolso.cliente?.cpf || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {reembolso.tipo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {reembolso.especialidade || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(reembolso.data_solicitacao)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(reembolso.valor_solicitado)}
                      </p>
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
                        <button
                          onClick={() => {
                            setSelectedReembolso(reembolso)
                            setShowModalAprovar(true)
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Aprovar"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReembolso(reembolso)
                            setShowModalRejeitar(true)
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Rejeitar"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CheckCircle size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium mb-1">Nenhum reembolso pendente!</p>
                    <p className="text-sm text-gray-400">Todas as solicitações foram processadas.</p>
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
              {/* Status Pendente */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                <Clock className="text-yellow-600" size={24} />
                <div>
                  <p className="font-semibold text-yellow-900">Aguardando Análise</p>
                  <p className="text-sm text-yellow-700">Este reembolso precisa ser aprovado ou rejeitado</p>
                </div>
              </div>

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
                  {selectedReembolso.descricao && (
                    <p><strong>Descrição:</strong> {selectedReembolso.descricao}</p>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetalhesModal(false)
                    setShowModalAprovar(true)
                  }}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Aprovar Reembolso
                </button>
                <button
                  onClick={() => {
                    setShowDetalhesModal(false)
                    setShowModalRejeitar(true)
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aprovar */}
      {showModalAprovar && selectedReembolso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Aprovação</h2>
            <p className="text-gray-700 mb-6">
              Deseja realmente aprovar este reembolso no valor de{' '}
              <strong>{formatCurrency(selectedReembolso.valor_solicitado)}</strong>?
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
      {showModalRejeitar && selectedReembolso && (
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