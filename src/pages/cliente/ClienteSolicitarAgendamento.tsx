import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/format'
import { Copy, CheckCircle, ExternalLink } from 'lucide-react'
import type { NovoAgendamento } from '@/types'

interface PaymentModalData {
  agendamentoId: number
  valor: number
  qrCodeImage: string | null
  pixCopiaECola: string | null
  pixId: string | null
  expirationDate: string | null
}

export const ClienteSolicitarAgendamento = () => {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  console.log('=== ClienteSolicitarAgendamento ===')
  console.log('Cliente do useAuth:', cliente)
  console.log('Cliente ID:', cliente?.id)
  console.log('==================================')

  const [formData, setFormData] = useState({
    especialidadeId: '',
    estabelecimentoId: '',
    dataPreferencial: '',
    periodoPreferencial: '',
    observacoes: '',
  })

  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentModalData | null>(null)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [pixCopiado, setPixCopiado] = useState(false)

  // Buscar especialidades
  const { data: especialidades, isLoading: loadingEspecialidades } = useQuery({
    queryKey: ['especialidades'],
    queryFn: () => ApiService.getEspecialidades(),
    enabled: true,
  })

  // Buscar estabelecimentos
  const { data: estabelecimentos, isLoading: loadingEstabelecimentos } = useQuery({
    queryKey: ['estabelecimentos'],
    queryFn: () => ApiService.getEstabelecimentos(),
    enabled: true,
  })

  console.log('Especialidades:', especialidades)
  console.log('Estabelecimentos:', estabelecimentos)

  // Mutation para criar agendamento
  const createAgendamentoMutation = useMutation({
    mutationFn: async (dados: NovoAgendamento) => {
      // 1. Criar agendamento
      const agendamento = await ApiService.createAgendamento(dados)
      
      // 2. Gerar pagamento
      const pagamento = await ApiService.createPagamento(
        agendamento.id,
        agendamento.valor_coparticipacao
      )

      return { agendamento, pagamento }
    },
    onSuccess: async ({ agendamento, pagamento }) => {
      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })

      // Mostrar alert de sucesso
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 5000)

      // Limpar formulário
      setFormData({
        especialidadeId: '',
        estabelecimentoId: '',
        dataPreferencial: '',
        periodoPreferencial: '',
        observacoes: '',
      })

      // Chamar webhook para gerar QR Code
      await gerarQRCodePagamento(agendamento.id, pagamento.id, pagamento.valor)
    },
    onError: (error) => {
      console.error('Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento. Tente novamente.')
    },
  })

  // Função para chamar webhook e gerar QR Code
  const gerarQRCodePagamento = async (
    agendamentoId: number,
    pagamentoId: number,
    valor: number
  ) => {
    setLoadingPayment(true)

    try {
      const webhookUrl = import.meta.env.VITE_WEBHOOK_PAGAMENTO_URL || 'https://n8n.assorelseg.com.br/webhook/gerar-pagamento-consulta'

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agendamento_id: agendamentoId,
          pagamento_id: pagamentoId,
          valor: valor,
          cliente_id: cliente?.id,
          cliente_email: cliente?.usuario?.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar QR Code')
      }

      const data = await response.json()
      
      console.log('Resposta bruta do webhook:', data)

      // Extrair dados - o webhook retorna array com objeto vazio que contém json
      let pixData = null
      
      if (Array.isArray(data) && data.length > 0) {
        // Primeira tentativa: data[0].json
        if (data[0].json) {
          pixData = data[0].json
        }
        // Segunda tentativa: data[0][""].json  
        else if (data[0][""] && data[0][""].json) {
          pixData = data[0][""].json
        }
        // Terceira tentativa: direto data[0]
        else {
          pixData = data[0]
        }
      } else if (data.json) {
        pixData = data.json
      } else {
        pixData = data
      }

      console.log('Dados do PIX extraídos:', pixData)
      console.log('encodedImage existe?', !!pixData.encodedImage)
      console.log('Tamanho do encodedImage:', pixData.encodedImage?.length)

      if (!pixData || !pixData.payload) {
        throw new Error('Resposta do webhook inválida - payload não encontrado')
      }

      // Converter encodedImage para data URL
      const qrCodeImage = pixData.encodedImage 
        ? `data:image/png;base64,${pixData.encodedImage}`
        : null

      console.log('QR Code gerado:', qrCodeImage ? 'SIM ✅' : 'NÃO ❌')
      if (qrCodeImage) {
        console.log('Preview URL (100 chars):', qrCodeImage.substring(0, 100))
      }

      // Atualizar agendamento no banco com dados do PIX
      await ApiService.updateAgendamento(agendamentoId, {
        qrcode_pagamento: pixData.encodedImage || null,  // QR Code (imagem base64)
        pix_copia_cola: pixData.payload || null,          // PIX Copia e Cola (string)
      })

      console.log('Agendamento atualizado no banco')

      // Atualizar dados de pagamento para o modal
      const newPaymentData = {
        agendamentoId,
        valor,
        qrCodeImage: qrCodeImage,
        pixCopiaECola: pixData.payload || null,
        pixId: pixData.id || null,
        expirationDate: pixData.expirationDate || null,
      }
      
      console.log('=== DADOS DO MODAL ===')
      console.log('Payment Data:', newPaymentData)
      console.log('QR Code Image:', newPaymentData.qrCodeImage ? 'PRESENTE ✅' : 'AUSENTE ❌')
      console.log('=====================')
      
      setPaymentData(newPaymentData)

      console.log('Dados de pagamento configurados para modal')

      // Mostrar modal de pagamento
      setShowPaymentModal(true)
      console.log('Modal de pagamento aberto:', showPaymentModal)
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      
      // Mesmo sem QR Code, mostrar modal
      setPaymentData({
        agendamentoId,
        valor,
        qrCodeImage: null,
        pixCopiaECola: null,
        pixId: null,
        expirationDate: null,
      })
      
      setShowPaymentModal(true)
    } finally {
      setLoadingPayment(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('=== SUBMIT AGENDAMENTO ===')
    console.log('Cliente:', cliente)
    console.log('Cliente ID:', cliente?.id)
    console.log('Usuário:', cliente?.usuario)

    if (!cliente || !cliente.id) {
      console.error('Cliente não encontrado ou sem ID')
      alert('Erro: Você precisa estar logado como cliente para solicitar um agendamento')
      return
    }

    if (!formData.especialidadeId || !formData.estabelecimentoId || !formData.dataPreferencial) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    console.log('Criando agendamento...')

    const novoAgendamento: NovoAgendamento = {
      cliente_id: cliente.id,
      especialidade_id: parseInt(formData.especialidadeId),
      estabelecimento_id: parseInt(formData.estabelecimentoId),
      observacoes: formData.observacoes || null,
      valor_coparticipacao: 25.00,
    }

    console.log('Dados do agendamento:', novoAgendamento)

    createAgendamentoMutation.mutate(novoAgendamento)
  }

  const copiarPixCopiaECola = () => {
    if (paymentData?.pixCopiaECola) {
      navigator.clipboard.writeText(paymentData.pixCopiaECola)
      setPixCopiado(true)
      setTimeout(() => setPixCopiado(false), 3000)
    }
  }

  return (
    <div>
      <Alert variant="info">
        <strong>📋 Importante:</strong> O agendamento será confirmado em até 24 horas úteis. Você
        receberá uma notificação por e-mail e poderá acompanhar o status em "Meus Agendamentos".
      </Alert>

      {showSuccessAlert && (
        <Alert variant="info">
          <strong>✓ Solicitação enviada com sucesso!</strong>
          <br />
          Sua solicitação de agendamento foi recebida. Você receberá um e-mail com a confirmação em
          breve.
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,520px)_1fr] gap-6 items-start">
        {/* Formulário */}
        <Card className="bg-transparent shadow-none p-0">
          <Card>
            <CardTitle>Solicitar Novo Agendamento</CardTitle>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Especialidade Médica *
                  </label>
                  <select
                    required
                    value={formData.especialidadeId}
                    onChange={(e) =>
                      setFormData({ ...formData, especialidadeId: e.target.value })
                    }
                    disabled={loadingEspecialidades}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    <option value="">
                      {loadingEspecialidades
                        ? 'Carregando...'
                        : especialidades && especialidades.length > 0
                        ? 'Selecione a especialidade'
                        : 'Nenhuma especialidade disponível'}
                    </option>
                    {especialidades?.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nome}
                      </option>
                    ))}
                  </select>
                  {!loadingEspecialidades && (!especialidades || especialidades.length === 0) && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Nenhuma especialidade cadastrada no sistema
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Estabelecimento *
                  </label>
                  <select
                    required
                    value={formData.estabelecimentoId}
                    onChange={(e) =>
                      setFormData({ ...formData, estabelecimentoId: e.target.value })
                    }
                    disabled={loadingEstabelecimentos}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    <option value="">
                      {loadingEstabelecimentos
                        ? 'Carregando...'
                        : estabelecimentos && estabelecimentos.length > 0
                        ? 'Selecione o estabelecimento'
                        : 'Nenhum estabelecimento disponível'}
                    </option>
                    {estabelecimentos?.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.nome} - {est.cidade}/{est.estado}
                      </option>
                    ))}
                  </select>
                  {!loadingEstabelecimentos && (!estabelecimentos || estabelecimentos.length === 0) && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Nenhum estabelecimento cadastrado no sistema
                    </p>
                  )}
                </div>

                
                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Dia da semana Preferencial *
                  </label>
                  <select
                    required
                    value={formData.dataPreferencial}
                    onChange={(e) =>
                      setFormData({ ...formData, dataPreferencial: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    <option value="">Selecione</option>
                    <option value="manha">Segunda</option>
                    <option value="tarde">Terça</option>
                    <option value="noite">Quarta</option>
                    <option value="noite">Quinta</option>
                    <option value="noite">Sexta</option>
                    <option value="noite">Sábado</option>
                    
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Período Preferencial *
                  </label>
                  <select
                    required
                    value={formData.periodoPreferencial}
                    onChange={(e) =>
                      setFormData({ ...formData, periodoPreferencial: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    <option value="">Selecione</option>
                    <option value="manha">Início da Manhã (08h às 10h)</option>
                    <option value="manha">Fim da Manhã (10h às 12h)</option>
                    <option value="tarde">Início da Tarde (13h às 15h)</option>
                    <option value="noite">Fim da Tarde (15h às 17h)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Observações (opcional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Descreva aqui informações adicionais sobre o agendamento..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] resize-none"
                  />
                </div>

                <Button type="submit" fullWidth isLoading={createAgendamentoMutation.isPending}>
                  {createAgendamentoMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
                </Button>
              </div>
            </form>
          </Card>
        </Card>

        {/* Mapa */}
        <div className="sticky top-4">
          <Card>
            <CardTitle>Localização</CardTitle>
            <div className="w-full h-[420px] bg-gray-100 rounded-xl flex items-center justify-center text-text-secondary">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p>Mapa será exibido aqui</p>
                <p className="text-xs mt-1">(Google Maps)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Pagamento da Coparticipação"
        size="md"
      >
        {loadingPayment ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Gerando QR Code de pagamento...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Debug - pode remover depois */}
            {console.log('RENDERIZANDO MODAL - paymentData:', paymentData)}
            {console.log('RENDERIZANDO MODAL - qrCodeImage:', paymentData?.qrCodeImage)}
            
            {/* Valor */}
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Valor da Coparticipação</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(paymentData?.valor || 0)}
              </p>
            </div>

            {/* ID do PIX */}
            {paymentData?.pixId && (
              <div className="text-center">
                <p className="text-xs text-gray-500">ID da Transação</p>
                <p className="font-mono text-sm text-gray-700">{paymentData.pixId}</p>
              </div>
            )}

            {/* QR Code */}
            {paymentData?.qrCodeImage ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Escaneie o QR Code com seu app de pagamento:
                </p>
                <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                  <img
                    src={paymentData.qrCodeImage}
                    alt="QR Code PIX"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">QR Code não disponível</p>
              </div>
            )}

            {/* PIX Copia e Cola */}
            {paymentData?.pixCopiaECola && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Ou copie o código PIX:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData.pixCopiaECola}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-gray-50 font-mono"
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

            {/* Data de Expiração */}
            {paymentData?.expirationDate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>⏰ Expira em:</strong>{' '}
                  {new Date(paymentData.expirationDate).toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>⏱️ Importante:</strong> Após realizar o pagamento, seu agendamento será
                confirmado automaticamente. Você receberá uma notificação por e-mail.
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false)
                  navigate('/cliente/pagamentos')
                }}
                fullWidth
              >
                Ver Pagamentos
              </Button>
              <Button
                onClick={() => {
                  setShowPaymentModal(false)
                  navigate('/cliente/agendamentos')
                }}
                fullWidth
              >
                Ver Agendamentos
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}