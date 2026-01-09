import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { 
  Building2, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  FileText,
  AlertCircle
} from 'lucide-react'
import { ApiService } from '@/services/api.service'
import { formatDate } from '@/utils/format'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const AdminEstabelecimentosIndicados = () => {
  const queryClient = useQueryClient()
  const [selectedIndicacao, setSelectedIndicacao] = useState<any>(null)
  const [showAprovarModal, setShowAprovarModal] = useState(false)
  const [showReprovarModal, setShowReprovarModal] = useState(false)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [motivoReprovacao, setMotivoReprovacao] = useState('')
  const [observacoesAprovacao, setObservacoesAprovacao] = useState('')

  // Buscar indicações pendentes
  const { data: indicacoes, isLoading } = useQuery({
    queryKey: ['indicacoes-pendentes'],
    queryFn: async () => {
      const { data, error } = await ApiService.supabase
        .from('indicacoes')
        .select(`
          *,
          cliente:clientes(
            id,
            cpf,
            usuario:usuarios(id, nome, email, telefone)
          )
        `)
        .eq('status', 'pendente')
        .order('data_indicacao', { ascending: false })

      if (error) throw error
      return data
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })

  // Mutation para aprovar indicação
  const aprovarMutation = useMutation({
    mutationFn: async ({ id, observacoes }: { id: number; observacoes: string }) => {
      // 1. Atualizar status da indicação
      const { data: indicacao, error: indicacaoError } = await ApiService.supabase
        .from('indicacoes')
        .update({
          status: 'aprovado',
          data_aprovacao: new Date().toISOString(),
          observacoes_admin: observacoes,
        })
        .eq('id', id)
        .select(`
          *,
          cliente:clientes(usuario:usuarios(id, nome))
        `)
        .single()

      if (indicacaoError) throw indicacaoError

      // 2. Criar o estabelecimento
      const { data: estabelecimento, error: estabelecimentoError } = await ApiService.supabase
        .from('estabelecimentos')
        .insert({
          nome: indicacao.nome_estabelecimento,
          endereco: indicacao.endereco,
          cidade: indicacao.cidade,
          estado: indicacao.estado,
          telefone: indicacao.telefone,
          email: indicacao.email,
          tipo: indicacao.tipo_estabelecimento || 'Clínica',
          observacoes: `Indicado por: ${indicacao.cliente?.usuario?.nome || 'Cliente'}`,
          ativo: true,
        })
        .select()
        .single()

      if (estabelecimentoError) throw estabelecimentoError

      // 3. Criar notificação para o cliente
      const { data: adminUser } = await ApiService.supabase
        .from('usuarios')
        .select('id')
        .eq('id', indicacao.cliente_id)
        .single()

      if (adminUser) {
        await ApiService.createNotificacao({
          usuario_id: adminUser.id,
          titulo: 'Indicação Aprovada',
          mensagem: `Sua indicação de estabelecimento "${indicacao.nome_estabelecimento}" foi aprovada e cadastrada no sistema!`,
          tipo: 'sucesso',
          link: '/cliente/indicacoes',
        })
      }

      return { indicacao, estabelecimento }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicacoes-pendentes'] })
      queryClient.invalidateQueries({ queryKey: ['estabelecimentos'] })
      setShowAprovarModal(false)
      setSelectedIndicacao(null)
      setObservacoesAprovacao('')
      alert('✅ Indicação aprovada e estabelecimento cadastrado com sucesso!')
    },
  })

  // Mutation para reprovar indicação
  const reprovarMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      const { data, error } = await ApiService.supabase
        .from('indicacoes')
        .update({
          status: 'reprovado',
          data_reprovacao: new Date().toISOString(),
          motivo_reprovacao: motivo,
        })
        .eq('id', id)
        .select(`
          *,
          cliente:clientes(usuario:usuarios(id))
        `)
        .single()

      if (error) throw error

      // Criar notificação para o cliente
      if (data.cliente?.usuario?.id) {
        await ApiService.createNotificacao({
          usuario_id: data.cliente.usuario.id,
          titulo: 'Indicação Reprovada',
          mensagem: `Sua indicação de estabelecimento foi reprovada. Motivo: ${motivo}`,
          tipo: 'erro',
          link: '/cliente/indicacoes',
        })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicacoes-pendentes'] })
      setShowReprovarModal(false)
      setSelectedIndicacao(null)
      setMotivoReprovacao('')
      alert('Indicação reprovada!')
    },
  })

  const handleVerDetalhes = (indicacao: any) => {
    setSelectedIndicacao(indicacao)
    setShowDetalhesModal(true)
  }

  const handleAprovar = (indicacao: any) => {
    setSelectedIndicacao(indicacao)
    setShowAprovarModal(true)
  }

  const handleReprovar = (indicacao: any) => {
    setSelectedIndicacao(indicacao)
    setShowReprovarModal(true)
  }

  const handleSubmitAprovar = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIndicacao) {
      aprovarMutation.mutate({
        id: selectedIndicacao.id,
        observacoes: observacoesAprovacao
      })
    }
  }

  const handleSubmitReprovar = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIndicacao && motivoReprovacao.trim()) {
      reprovarMutation.mutate({
        id: selectedIndicacao.id,
        motivo: motivoReprovacao
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

  const totalPendentes = indicacoes?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estabelecimentos Indicados</h1>
        <p className="text-gray-600 mt-1">Gerencie indicações de novos estabelecimentos pelos clientes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{totalPendentes}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Aprovadas (Total)</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert */}
      {totalPendentes > 0 && (
        <Alert variant="warning">
          <strong>⚠️ Atenção:</strong> Existem {totalPendentes} indicações pendentes aguardando análise.
        </Alert>
      )}

      {/* Lista de Indicações */}
      <div className="space-y-4">
        {totalPendentes === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Building2 className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma indicação pendente
              </h3>
              <p className="text-gray-600">
                Todas as indicações foram processadas
              </p>
            </div>
          </Card>
        ) : (
          indicacoes?.map((indicacao: any) => (
            <Card key={indicacao.id}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Informações da Indicação */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">PENDENTE</Badge>
                    <span className="text-xs text-gray-500">
                      Indicado em {formatDate(indicacao.data_indicacao)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Cliente */}
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <span className="text-gray-600">Indicado por: </span>
                        <span className="font-medium text-gray-900">
                          {indicacao.cliente?.usuario?.nome || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Nome do Estabelecimento */}
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 size={16} className="text-gray-400" />
                      <div>
                        <span className="text-gray-600">Estabelecimento: </span>
                        <span className="font-medium text-gray-900">
                          {indicacao.nome_estabelecimento}
                        </span>
                      </div>
                    </div>

                    {/* Tipo */}
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase size={16} className="text-gray-400" />
                      <div>
                        <span className="text-gray-600">Tipo: </span>
                        <span className="font-medium text-gray-900">
                          {indicacao.tipo_estabelecimento || 'Não informado'}
                        </span>
                      </div>
                    </div>

                    {/* Localização */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <span className="text-gray-600">Localização: </span>
                        <span className="font-medium text-gray-900">
                          {indicacao.cidade}/{indicacao.estado}
                        </span>
                      </div>
                    </div>

                    {/* Telefone */}
                    {indicacao.telefone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-gray-400" />
                        <div>
                          <span className="text-gray-600">Telefone: </span>
                          <span className="font-medium text-gray-900">
                            {indicacao.telefone}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {indicacao.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} className="text-gray-400" />
                        <div>
                          <span className="text-gray-600">Email: </span>
                          <span className="font-medium text-gray-900">
                            {indicacao.email}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Endereço */}
                    <div className="flex items-start gap-2 text-sm col-span-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Endereço: </span>
                        <span className="font-medium text-gray-900">
                          {indicacao.endereco}
                        </span>
                      </div>
                    </div>

                    {/* Observações do Cliente */}
                    {indicacao.observacoes && (
                      <div className="col-span-2 text-sm">
                        <span className="text-gray-600">Observações do Cliente: </span>
                        <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                          {indicacao.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 lg:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleVerDetalhes(indicacao)}
                    className="w-full lg:w-auto"
                  >
                    Ver Detalhes
                  </Button>
                  <Button
                    onClick={() => handleAprovar(indicacao)}
                    className="w-full lg:w-auto"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReprovar(indicacao)}
                    className="w-full lg:w-auto"
                  >
                    <XCircle size={18} className="mr-2" />
                    Reprovar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        title="Detalhes da Indicação"
        size="lg"
      >
        {selectedIndicacao && (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User size={18} className="text-primary" />
                Cliente que Indicou
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Nome:</strong> {selectedIndicacao.cliente?.usuario?.nome}</p>
                <p><strong>CPF:</strong> {selectedIndicacao.cliente?.cpf}</p>
                <p><strong>Email:</strong> {selectedIndicacao.cliente?.usuario?.email}</p>
                <p><strong>Telefone:</strong> {selectedIndicacao.cliente?.usuario?.telefone || 'Não informado'}</p>
              </div>
            </div>

            {/* Informações do Estabelecimento */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                Dados do Estabelecimento
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Nome:</strong> {selectedIndicacao.nome_estabelecimento}</p>
                <p><strong>Tipo:</strong> {selectedIndicacao.tipo_estabelecimento || 'Não informado'}</p>
                <p><strong>Endereço:</strong> {selectedIndicacao.endereco}</p>
                <p><strong>Cidade/Estado:</strong> {selectedIndicacao.cidade}/{selectedIndicacao.estado}</p>
                {selectedIndicacao.telefone && (
                  <p><strong>Telefone:</strong> {selectedIndicacao.telefone}</p>
                )}
                {selectedIndicacao.email && (
                  <p><strong>Email:</strong> {selectedIndicacao.email}</p>
                )}
                {selectedIndicacao.observacoes && (
                  <div>
                    <strong>Observações:</strong>
                    <p className="mt-1 text-gray-700">{selectedIndicacao.observacoes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informações da Indicação */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Informações da Indicação
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Data da Indicação:</strong> {formatDate(selectedIndicacao.data_indicacao)}</p>
                <p><strong>Status:</strong> <Badge variant="warning">Pendente</Badge></p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Aprovação */}
      <Modal
        isOpen={showAprovarModal}
        onClose={() => setShowAprovarModal(false)}
        title="Aprovar Indicação"
        size="lg"
      >
        <form onSubmit={handleSubmitAprovar} className="space-y-4">
          <Alert variant="info">
            <strong>✅ Confirmação:</strong> Ao aprovar, o estabelecimento será automaticamente cadastrado no sistema.
          </Alert>

          {selectedIndicacao && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Estabelecimento:</strong> {selectedIndicacao.nome_estabelecimento}</p>
              <p><strong>Cidade/Estado:</strong> {selectedIndicacao.cidade}/{selectedIndicacao.estado}</p>
              <p><strong>Endereço:</strong> {selectedIndicacao.endereco}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações da Aprovação (Opcional)
            </label>
            <textarea
              value={observacoesAprovacao}
              onChange={(e) => setObservacoesAprovacao(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Ex: Estabelecimento verificado e aprovado para cadastro..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAprovarModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={aprovarMutation.isPending}
              className="flex-1"
            >
              Confirmar Aprovação
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Reprovação */}
      <Modal
        isOpen={showReprovarModal}
        onClose={() => setShowReprovarModal(false)}
        title="Reprovar Indicação"
        size="md"
      >
        <form onSubmit={handleSubmitReprovar} className="space-y-4">
          <Alert variant="danger">
            <strong>⚠️ Atenção:</strong> O cliente será notificado sobre a reprovação.
          </Alert>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Reprovação *
            </label>
            <textarea
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              rows={4}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Ex: Estabelecimento não atende aos critérios necessários..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowReprovarModal(false)
                setMotivoReprovacao('')
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={reprovarMutation.isPending}
              disabled={!motivoReprovacao.trim()}
              className="flex-1"
            >
              Confirmar Reprovação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}