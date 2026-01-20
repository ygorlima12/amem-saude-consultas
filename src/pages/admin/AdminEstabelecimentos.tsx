import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/utils/format'

export const AdminEstabelecimentos = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  })

  // Buscar estabelecimentos
  const { data: estabelecimentos, isLoading } = useQuery({
    queryKey: ['admin-estabelecimentos'],
    queryFn: () => ApiService.getAllEstabelecimentos(),
  })
  

  // Mutation criar/atualizar estabelecimento
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedEstabelecimento) {
        return await ApiService.updateEstabelecimento(selectedEstabelecimento.id, data)
      } else {
        return await ApiService.createEstabelecimento(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-estabelecimentos'] })
      setShowModal(false)
      resetForm()
      alert(selectedEstabelecimento ? '✅ Estabelecimento atualizado!' : '✅ Estabelecimento criado!')
    },
    onError: (error: any) => {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar estabelecimento. Tente novamente.')
    },
  })

  // Mutation para desativar estabelecimento
  const desativarMutation = useMutation({
    mutationFn: (id: number) => ApiService.desativarEstabelecimento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-estabelecimentos'] })
      alert('✅ Estabelecimento desativado!')
    },
    onError: (error: any) => {
      console.error('Erro ao desativar:', error)
      alert('Erro ao desativar estabelecimento.')
    },
  })

  const resetForm = () => {
    setFormData({
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
    })
    setSelectedEstabelecimento(null)
  }

  const handleEdit = (estabelecimento: any) => {
    setSelectedEstabelecimento(estabelecimento)
    setFormData({
      nome: estabelecimento.nome || '',
      cnpj: estabelecimento.cnpj || '',
      email: estabelecimento.email || '',
      telefone: estabelecimento.telefone || '',
      endereco: estabelecimento.endereco || '',
      cidade: estabelecimento.cidade || '',
      estado: estabelecimento.estado || '',
      cep: estabelecimento.cep || '',
    })
    setShowModal(true)
  }

  const handleVerDetalhes = (estabelecimento: any) => {
    setSelectedEstabelecimento(estabelecimento)
    setShowDetalhesModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  // Stats
  const stats = {
    total: estabelecimentos?.length || 0,
    ativos: estabelecimentos?.filter(c => c.ativo).length || 0,
    inativos: estabelecimentos?.filter(c => !c.ativo).length || 0,
    novosEsteMes: estabelecimentos?.filter(c => {
      const created = new Date(c.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear()
    }).length || 0,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estabelecimentos</h1>
          <p className="text-gray-600 mt-1">Gerencie os estabelecimentos do sistema</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus size={18} />
          Novo Estabelecimento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ativos}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Inativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inativos}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Plus size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Novos este Mês</p>
              <p className="text-2xl font-bold text-gray-900">{stats.novosEsteMes}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por Razão Social, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} />
            Exportar
          </Button>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Estabelecimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estabelecimentos && estabelecimentos.length > 0 ? (
                estabelecimentos
                  .filter((est: any) => {
                    // Filtro de status
                    if (filtroStatus === 'ativos' && !est.ativo) return false
                    if (filtroStatus === 'inativos' && est.ativo) return false
                    
                    // Filtro de busca
                    if (searchTerm) {
                      const termo = searchTerm.toLowerCase()
                      return (
                        est.nome?.toLowerCase().includes(termo) ||
                        est.cnpj?.toLowerCase().includes(termo) ||
                        est.email?.toLowerCase().includes(termo) ||
                        est.cidade?.toLowerCase().includes(termo)
                      )
                    }
                    
                    return true
                  })
                  .map((estabelecimento: any) => (
                  <tr key={estabelecimento.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users size={18} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{estabelecimento.nome || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{estabelecimento.cnpj || 'Sem CNPJ'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} />
                          {estabelecimento.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          {estabelecimento.telefone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        {estabelecimento.cidade && estabelecimento.estado 
                          ? `${estabelecimento.cidade}/${estabelecimento.estado}`
                          : 'Não informado'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        estabelecimento.ativo 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {estabelecimento.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(estabelecimento.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerDetalhes(estabelecimento)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(estabelecimento)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Deseja realmente desativar este estabelecimento?')) {
                              desativarMutation.mutate(estabelecimento.id)
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhum Estabelecimento encontrada</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Novo/Editar estabelecimento */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={selectedEstabelecimento ? 'Editar estabelecimento' : 'Novo estabelecimento'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Razão Social"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
            <Input
              label="CNPJ"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              required
            />
            <Input
              label="CEP"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
            />
            <Input
              label="Cidade"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            />
            <Input
              label="Estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            />
            <div className="md:col-span-2">
              <Input
                label="Endereço"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {selectedEstabelecimento ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalhes */}
      <Modal
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        title="Detalhes do estabelecimento"
        size="md"
      >
        {selectedEstabelecimento && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Users size={32} className="text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedEstabelecimento.nome}
                </h3>
                <p className="text-gray-600">{selectedEstabelecimento.cnpj}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">{selectedEstabelecimento.email || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Telefone</p>
                <p className="text-gray-900">{selectedEstabelecimento.telefone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Endereço</p>
                <p className="text-gray-900">
                  {selectedEstabelecimento.endereco || 'Não informado'}
                  {selectedEstabelecimento.cidade && `, ${selectedEstabelecimento.cidade}`}
                  {selectedEstabelecimento.estado && `/${selectedEstabelecimento.estado}`}
                  {selectedEstabelecimento.cep && ` - ${selectedEstabelecimento.cep}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedEstabelecimento.ativo 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedEstabelecimento.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Cadastrado em</p>
                <p className="text-gray-900">{formatDate(selectedEstabelecimento.created_at)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowDetalhesModal(false)}
              fullWidth
            >
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}