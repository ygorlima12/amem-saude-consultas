import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
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
  Download,
  Calendar
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'

export const AdminReembolsosPendentes = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReembolso, setSelectedReembolso] = useState<any>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [showModalAprovar, setShowModalAprovar] = useState(false)
  const [showModalReprovar, setShowModalReprovar] = useState(false)
  const [showModalPagar, setShowModalPagar] = useState(false)
  const [motivoReprovacao, setMotivoReprovacao] = useState('')
  const [valorAprovado, setValorAprovado] = useState('')
  const [observacoesPagamento, setObservacoesPagamento] = useState('')
  
  // Estados para validação de valor
  const [erroValor, setErroValor] = useState('')
  const [valorDigitadoConfirmado, setValorDigitadoConfirmado] = useState(false)
  const [statusProcessamento, setStatusProcessamento] = useState('')

  // Buscar reembolsos pendentes
  const { data: reembolsos, isLoading } = useQuery({
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
            usuario:usuarios(id, nome, email, telefone)
          ),
          especialidade:especialidades(id, nome)
        `)
        .in('status', ['pendente', 'em_analise'])
        .order('data_solicitacao', { ascending: true })

      if (error) throw error

      let resultado = data || []

      if (searchTerm) {
        resultado = resultado.filter(r =>
          r.cliente?.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.cliente?.cpf?.includes(searchTerm)
        )
      }

      return resultado
    },
  })

  // Estatísticas
  const stats = {
    total: reembolsos?.length || 0,
    valorTotal: reembolsos?.reduce((sum, r) => sum + (r.valor_estimado || 0), 0) || 0,
    consultas: reembolsos?.filter(r => r.tipo === 'consulta').length || 0,
    exames: reembolsos?.filter(r => r.tipo === 'exame').length || 0,
  }

  // Mutation para aprovar
  const aprovarMutation = useMutation({
    mutationFn: async ({ id, valor }: { id: number; valor: number }) => {
      // 1. Aprovar no banco de dados
      setStatusProcessamento('⏳ Aprovando reembolso no sistema...')
      const reembolsoAprovado = await ApiService.aprovarReembolso(id, valor)

      // 2. Chamar webhook para processar pagamento
      setStatusProcessamento('💳 Processando pagamento via PIX...')
      try {
        const webhookUrl = 'https://n8n.assorelseg.com.br/webhook/fazer-reembolso'
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reembolsoId: id,
            valor: valor,
            chavePix: selectedReembolso.chave_pix,
            tipoPix: selectedReembolso.tipo_pix,
            clienteId: selectedReembolso.cliente_id,
            clienteNome: selectedReembolso.cliente?.usuario?.nome,
            clienteCPF: selectedReembolso.cliente?.cpf,
            clienteEmail: selectedReembolso.cliente?.usuario?.email,
            tipo: selectedReembolso.tipo,
            dataAprovacao: new Date().toISOString(),
          }),
        })

        if (!webhookResponse.ok) {
          console.error('Erro ao chamar webhook:', await webhookResponse.text())
          setStatusProcessamento('⚠️ Reembolso aprovado, mas houve erro ao processar pagamento')
          throw new Error('Webhook retornou erro')
        }

        const webhookData = await webhookResponse.json()
        console.log('✅ Webhook chamado com sucesso:', webhookData)
        setStatusProcessamento('✅ Pagamento enviado com sucesso!')
      } catch (webhookError) {
        console.error('⚠️ Erro ao chamar webhook (reembolso já foi aprovado no banco):', webhookError)
        setStatusProcessamento('⚠️ Reembolso aprovado. Verificar status do pagamento manualmente.')
        // Não vamos bloquear a aprovação se o webhook falhar
      }

      return reembolsoAprovado
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos-pendentes'] })
      queryClient.invalidateQueries({ queryKey: ['reembolsos'] })
      
      // Aguardar 2 segundos para mostrar mensagem de sucesso
      setTimeout(() => {
        setShowModalAprovar(false)
        setShowDetalhesModal(false)
        setStatusProcessamento('')
        alert('✅ Reembolso aprovado com sucesso! O pagamento foi enviado para processamento.')
        limparFormularios()
      }, 2000)
    },
    onError: (error) => {
      console.error('Erro ao aprovar reembolso:', error)
      setStatusProcessamento('')
      alert('❌ Erro ao aprovar reembolso. Tente novamente.')
    },
  })

  // Mutation para reprovar
  const reprovarMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      return await ApiService.reprovarReembolso(id, motivo)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos-pendentes'] })
      queryClient.invalidateQueries({ queryKey: ['reembolsos'] })
      setShowModalReprovar(false)
      setShowDetalhesModal(false)
      alert('Reembolso reprovado!')
      limparFormularios()
    },
  })

  // Mutation para marcar como pago
  const pagarMutation = useMutation({
    mutationFn: async ({ id, obs }: { id: number; obs?: string }) => {
      return await ApiService.marcarReembolsoPago(id, obs)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos-pendentes'] })
      queryClient.invalidateQueries({ queryKey: ['reembolsos'] })
      setShowModalPagar(false)
      setShowDetalhesModal(false)
      alert('Reembolso marcado como pago!')
      limparFormularios()
    },
  })

  const limparFormularios = () => {
    setMotivoReprovacao('')
    setValorAprovado('')
    setObservacoesPagamento('')
    setErroValor('')
    setValorDigitadoConfirmado(false)
  }

  const handleVerDetalhes = (reembolso: any) => {
    setSelectedReembolso(reembolso)
    setValorAprovado('')
    setErroValor('')
    setValorDigitadoConfirmado(false)
    setShowDetalhesModal(true)
  }

  const handleAprovar = () => {
    // Validar se preencheu
    if (!valorAprovado || valorAprovado.trim() === '') {
      setErroValor('Por favor, digite o valor')
      return
    }

    const valorDigitado = parseFloat(valorAprovado)
    const valorEsperado = selectedReembolso?.valor_estimado || 0

    // Validar se é um número válido
    if (isNaN(valorDigitado) || valorDigitado <= 0) {
      setErroValor('Digite um valor válido maior que zero')
      return
    }

    // ✅ VALIDAÇÃO RIGOROSA: Valor deve ser EXATAMENTE igual ao estimado
    // Arredonda para 2 casas decimais para evitar problemas de floating point
    const valorDigitadoArredondado = Math.round(valorDigitado * 100) / 100
    const valorEsperadoArredondado = Math.round(valorEsperado * 100) / 100

    if (valorDigitadoArredondado !== valorEsperadoArredondado) {
      setErroValor(
        `O valor digitado (${formatCurrency(valorDigitado)}) não corresponde ao valor estimado (${formatCurrency(valorEsperado)}). Digite exatamente o valor mostrado acima.`
      )
      return
    }

    // ✅ Se chegou aqui, o valor está correto
    setErroValor('')
    aprovarMutation.mutate({
      id: selectedReembolso.id,
      valor: valorDigitado
    })
  }

  // Handler para validação em tempo real
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoValor = e.target.value
    setValorAprovado(novoValor)
    
    setErroValor('')
    
    if (novoValor && !isNaN(parseFloat(novoValor))) {
      const valorDigitado = Math.round(parseFloat(novoValor) * 100) / 100
      const valorEsperado = Math.round((selectedReembolso?.valor_estimado || 0) * 100) / 100
      
      if (valorDigitado === valorEsperado) {
        setValorDigitadoConfirmado(true)
      } else {
        setValorDigitadoConfirmado(false)
      }
    } else {
      setValorDigitadoConfirmado(false)
    }
  }

  const handleReprovar = () => {
    if (!motivoReprovacao.trim()) {
      alert('Informe o motivo da reprovação')
      return
    }
    reprovarMutation.mutate({
      id: selectedReembolso.id,
      motivo: motivoReprovacao
    })
  }

  const handlePagar = () => {
    if (selectedReembolso.status !== 'aprovado') {
      alert('Apenas reembolsos aprovados podem ser marcados como pagos')
      return
    }
    pagarMutation.mutate({
      id: selectedReembolso.id,
      obs: observacoesPagamento
    })
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
    }
    const { label, variant } = config[status] || { label: status, variant: 'neutral' }
    return <Badge variant={variant}>{label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando reembolsos pendentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reembolsos Pendentes</h1>
          <p className="text-gray-600">Análise rápida de solicitações</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Clock className="text-warning" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.valorTotal)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Consultas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.consultas}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Receipt className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Exames</p>
              <p className="text-2xl font-bold text-gray-900">{stats.exames}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Busca */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Lista */}
      <div className="space-y-4">
        {reembolsos && reembolsos.length > 0 ? (
          reembolsos.map((reembolso: any) => (
            <Card key={reembolso.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getTipoLabel(reembolso.tipo)}
                    </h3>
                    {getStatusBadge(reembolso.status)}
                    <span className="text-sm text-gray-500">#{reembolso.id}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{reembolso.cliente?.usuario?.nome || 'N/A'}</span>
                    </div>

                    {reembolso.especialidade && (
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span>{reembolso.especialidade.nome}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Solicitado: {formatDate(reembolso.data_solicitacao)}</span>
                    </div>

                    {reembolso.data_atendimento && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Atendimento: {formatDate(reembolso.data_atendimento)}</span>
                      </div>
                    )}
                  </div>

                  {reembolso.chave_pix && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">PIX:</span>
                      <span className="ml-2 text-gray-600">
                        {reembolso.tipo_pix} - {reembolso.chave_pix}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Valor estimado de reembolso</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reembolso.valor_estimado)}
                    </p>
                  </div>

                  <Button size="sm" onClick={() => handleVerDetalhes(reembolso)}>
                    <Eye size={16} className="mr-1" />
                    Analisar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum reembolso pendente
            </h3>
            <p className="text-gray-600">Todas as solicitações foram processadas!</p>
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
                {getStatusBadge(selectedReembolso.status)}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">ID</p>
                <p className="font-mono text-sm font-semibold">#{selectedReembolso.id}</p>
              </div>
            </div>

            {/* Cliente */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Informações do Cliente</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Nome</p>
                  <p className="font-medium">{selectedReembolso.cliente?.usuario?.nome}</p>
                </div>
                <div>
                  <p className="text-gray-600">CPF</p>
                  <p className="font-medium">{selectedReembolso.cliente?.cpf}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{selectedReembolso.cliente?.usuario?.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Telefone</p>
                  <p className="font-medium">{selectedReembolso.cliente?.usuario?.telefone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Dados do Reembolso */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Dados do Reembolso</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Tipo</p>
                  <p className="font-medium">{getTipoLabel(selectedReembolso.tipo)}</p>
                </div>
                {selectedReembolso.especialidade && (
                  <div>
                    <p className="text-gray-600">Especialidade</p>
                    <p className="font-medium">{selectedReembolso.especialidade.nome}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Data Solicitação</p>
                  <p className="font-medium">{formatDate(selectedReembolso.data_solicitacao)}</p>
                </div>
                {selectedReembolso.data_atendimento && (
                  <div>
                    <p className="text-gray-600">Data Atendimento</p>
                    <p className="font-medium">{formatDate(selectedReembolso.data_atendimento)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Valores */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Valores</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor {selectedReembolso.tipo === 'consulta' ? 'da' : 'do'}{' '} {getTipoLabel(selectedReembolso.tipo)}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedReembolso.valor_total)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor estimado de reembolso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedReembolso.valor_estimado)}
                  </p>
                </div>
                {selectedReembolso.valor_aprovado && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Valor Aprovado</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(selectedReembolso.valor_aprovado)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* PIX */}
            {selectedReembolso.chave_pix && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Dados PIX</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tipo: {selectedReembolso.tipo_pix}</p>
                  <p className="font-mono text-lg font-semibold text-gray-900 mt-1">
                    {selectedReembolso.chave_pix}
                  </p>
                </div>
              </div>
            )}

            {/* Documentos */}
            {(selectedReembolso.url_nota_fiscal || selectedReembolso.url_receita || selectedReembolso.url_relatorio) && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Documentos</h4>
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
                      <span>Receita/Pedido Médico</span>
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
                      <span>Documento Titular</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Observações */}
            {selectedReembolso.observacoes && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Observações</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedReembolso.observacoes}
                </p>
              </div>
            )}

            {/* Ações */}
            {selectedReembolso.status === 'pendente' || selectedReembolso.status === 'em_analise' ? (
              <div className="flex gap-3 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowModalReprovar(true)}
                  fullWidth
                >
                  <XCircle size={16} className="mr-1" />
                  Reprovar
                </Button>
                <Button
                  onClick={() => setShowModalAprovar(true)}
                  fullWidth
                >
                  <CheckCircle size={16} className="mr-1" />
                  Aprovar
                </Button>
              </div>
            ) : selectedReembolso.status === 'aprovado' ? (
              <div className="flex gap-3 border-t pt-4">
                <Button
                  onClick={() => setShowModalPagar(true)}
                  fullWidth
                >
                  <DollarSign size={16} className="mr-1" />
                  Marcar como Pago
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Modal>

      {/* Modal Aprovar */}
      <Modal
        isOpen={showModalAprovar}
        onClose={() => {
          setShowModalAprovar(false)
          setErroValor('')
          setValorAprovado('')
          setValorDigitadoConfirmado(false)
        }}
        title="Aprovar Reembolso"
        size="md"
      >
        <div className="space-y-4">
          {/* Aviso importante */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ ATENÇÃO:</strong> Para aprovar, você deve digitar{' '}
              <strong className="text-md">EXATAMENTE</strong> o valor estimado: <strong>{formatCurrency(selectedReembolso?.valor_estimado || 0)}</strong>
            </p>
            <p className="text-xs text-red-700 mt-2">
              <strong>Importante:</strong> Ao confirmar, o pagamento será processado imediatamente.
            </p>
          </div>

          {/* Input de valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digite o valor exato mostrado acima: *
            </label>
            <input
              type="number"
              step="0.01"
              value={valorAprovado}
              onChange={handleValorChange}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                erroValor
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : valorDigitadoConfirmado
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-primary focus:ring-primary'
              }`}
              placeholder="0,00"
              autoFocus
            />
            
            {/* Feedback visual */}
            {valorDigitadoConfirmado && !erroValor && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">✓ Valor correto!</span>
              </div>
            )}

            {/* Mensagem de erro */}
            {erroValor && (
              <div className="flex items-start gap-2 mt-2 text-red-600">
                <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{erroValor}</span>
              </div>
            )}

            {/* Dica */}
            {!valorDigitadoConfirmado && !erroValor && valorAprovado && (
              <p className="text-xs text-gray-500 mt-2">
                Continue digitando... O valor deve ser exatamente {formatCurrency(selectedReembolso?.valor_estimado || 0)}
              </p>
            )}
          </div>

          {/* Resumo do reembolso */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumo:</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{getTipoLabel(selectedReembolso?.tipo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium">{selectedReembolso?.cliente?.usuario?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PIX ({selectedReembolso?.tipo_pix}):</span>
                <span className="font-mono text-xs">{selectedReembolso?.chave_pix}</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowModalAprovar(false)
                setErroValor('')
                setValorAprovado('')
                setValorDigitadoConfirmado(false)
                setStatusProcessamento('')
              }}
              fullWidth
              disabled={aprovarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAprovar}
              isLoading={aprovarMutation.isPending}
              disabled={!valorDigitadoConfirmado || aprovarMutation.isPending}
              fullWidth
              className={`${
                valorDigitadoConfirmado && !aprovarMutation.isPending
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }`}
            >
              {valorDigitadoConfirmado ? '✓ Confirmar Aprovação' : 'Digite o valor correto'}
            </Button>
          </div>

          {/* Status de Processamento */}
          {aprovarMutation.isPending && statusProcessamento && (
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-blue-800">{statusProcessamento}</p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Reprovar */}
      <Modal
        isOpen={showModalReprovar}
        onClose={() => setShowModalReprovar(false)}
        title="Reprovar Reembolso"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Atenção:</strong> Esta ação irá reprovar o reembolso e notificar o cliente.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Reprovação *
            </label>
            <textarea
              rows={4}
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Descreva o motivo da reprovação..."
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowModalReprovar(false)} fullWidth>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleReprovar}
              isLoading={reprovarMutation.isPending}
              fullWidth
            >
              Confirmar Reprovação
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Pagar */}
      <Modal
        isOpen={showModalPagar}
        onClose={() => setShowModalPagar(false)}
        title="Marcar como Pago"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Confirme que o pagamento foi efetuado para este reembolso:
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Valor aprovado:</strong> {formatCurrency(selectedReembolso?.valor_aprovado || 0)}
            </p>
            {selectedReembolso?.chave_pix && (
              <p className="text-sm text-green-800 mt-1">
                <strong>PIX:</strong> {selectedReembolso.tipo_pix} - {selectedReembolso.chave_pix}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              rows={3}
              value={observacoesPagamento}
              onChange={(e) => setObservacoesPagamento(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Comprovante de pagamento, data, etc..."
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowModalPagar(false)} fullWidth>
              Cancelar
            </Button>
            <Button
              onClick={handlePagar}
              isLoading={pagarMutation.isPending}
              fullWidth
            >
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}