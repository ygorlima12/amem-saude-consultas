import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/format'
import { Copy, CheckCircle, ExternalLink, MapPin, Search, CreditCard } from 'lucide-react'
import type { NovoAgendamento } from '@/types'

interface PaymentModalData {
  agendamentoId: number
  valor: number
  qrCodeImage: string | null
  pixCopiaECola: string | null
  pixId: string | null
  expirationDate: string | null
}

interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export const ClienteSolicitarAgendamento = () => {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    especialidadeId: '',
    estabelecimentoId: '',
    dataPreferencial: '',
    periodoPreferencial: '',
    observacoes: '',
    cep: '',
  })

  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showConfirmacaoModal, setShowConfirmacaoModal] = useState(false)
  const [confirmouLeitura, setConfirmouLeitura] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentModalData | null>(null)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [pixCopiado, setPixCopiado] = useState(false)
  const [agendamentoPendente, setAgendamentoPendente] = useState<any>(null)

  const [cepInfo, setCepInfo] = useState<ViaCEPResponse | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)
  const [cepError, setCepError] = useState('')
  const [estabelecimentosSugeridos, setEstabelecimentosSugeridos] = useState<any[]>([])

  const { data: especialidades, isLoading: loadingEspecialidades } = useQuery({
    queryKey: ['especialidades'],
    queryFn: () => ApiService.getEspecialidades(),
  })

  const { data: todosEstabelecimentos, isLoading: loadingEstabelecimentos } = useQuery({
    queryKey: ['estabelecimentos'],
    queryFn: () => ApiService.getEstabelecimentos(),
  })

  const buscarCEP = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, '')

    if (cepLimpo.length !== 8) {
      setCepError('CEP deve conter 8 dígitos')
      return
    }

    setLoadingCep(true)
    setCepError('')
    setCepInfo(null)
    setEstabelecimentosSugeridos([])

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data: ViaCEPResponse = await response.json()

      if (data.erro) {
        setCepError('CEP não encontrado')
        setLoadingCep(false)
        return
      }

      setCepInfo(data)

      if (todosEstabelecimentos) {
        const estabelecimentosProximos = todosEstabelecimentos.filter((est: any) => {
          const cidadeMatch = est.cidade?.toLowerCase() === data.localidade.toLowerCase()
          const estadoMatch = est.estado?.toUpperCase() === data.uf.toUpperCase()
          return cidadeMatch && estadoMatch
        })

        setEstabelecimentosSugeridos(estabelecimentosProximos)

        if (estabelecimentosProximos.length > 0) {
          setFormData({
            ...formData,
            estabelecimentoId: estabelecimentosProximos[0].id.toString()
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      setCepError('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setLoadingCep(false)
    }
  }

  const handleCepChange = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '')
    const cepFormatado = apenasNumeros.replace(/^(\d{5})(\d{3})$/, '$1-$2')
    setFormData({ ...formData, cep: cepFormatado })

    if (cepInfo) {
      setCepInfo(null)
      setEstabelecimentosSugeridos([])
    }
  }

  const createAgendamentoMutation = useMutation({
    mutationFn: async (dados: NovoAgendamento) => {
      const agendamento = await ApiService.createAgendamento(dados)
      const pagamento = await ApiService.createPagamento(
        agendamento.id,
        agendamento.valor_coparticipacao
      )
      return { agendamento, pagamento }
    },
    onSuccess: async ({ agendamento, pagamento }) => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 5000)

      setAgendamentoPendente({ agendamento, pagamento })
      setShowConfirmacaoModal(true)
    },
    onError: (error) => {
      console.error('Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento. Tente novamente.')
    },
  })

  const continuarParaPagamento = async () => {
    if (!confirmouLeitura) {
      alert('Por favor, confirme que leu as informações importantes.')
      return
    }

    if (!agendamentoPendente) {
      alert('Erro ao processar pagamento. Tente novamente.')
      return
    }

    setShowConfirmacaoModal(false)
    setConfirmouLeitura(false)

    setFormData({
      especialidadeId: '',
      estabelecimentoId: '',
      dataPreferencial: '',
      periodoPreferencial: '',
      observacoes: '',
      cep: '',
    })
    setCepInfo(null)
    setEstabelecimentosSugeridos([])

    await gerarQRCodePagamento(
      agendamentoPendente.agendamento.id,
      agendamentoPendente.pagamento.id,
      agendamentoPendente.pagamento.valor
    )
  }

  const gerarQRCodePagamento = async (agendamentoId: number, pagamentoId: string, valor: number) => {
    setLoadingPayment(true)

    try {
      // Em desenvolvimento, usamos o proxy do Vite para evitar erro de CORS
      // Em produção, usa a URL direta (necessário que o servidor n8n aceite a origem)
      const webhookUrl = import.meta.env.DEV
        ? '/webhook/pix-payment'
        : 'https://n8n.assorelseg.com.br/webhook/pix-payment'
      console.log('Dados do pagamento (debug):', {
        agendamentoId,
        pagamentoId,
        valor
      })

      const payload = {
        valor: valor,
        descricao: 'Pagamento Coparticipacao',
        paymentId: pagamentoId,
        agendamentoId: agendamentoId,
      }

      console.log('Payload enviado para webhook:', JSON.stringify(payload))

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('Erro response webhook:', text)
        try {
          const jsonError = JSON.parse(text)
          throw new Error(jsonError.message || jsonError.error || `Erro do Servidor: ${response.status}`)
        } catch (e) {
          throw new Error(`Erro ao gerar pagamento PIX: ${response.status} - ${text.substring(0, 50)}`)
        }
      }

      const data = await response.json()

      let qrCodeBase64 = null
      let pixCopiaECola = null

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        qrCodeBase64 = firstItem.encodedImage || null
        pixCopiaECola = firstItem.payload || null
      } else if (typeof data === 'object') {
        // Fallback caso a estrutura não seja array
        qrCodeBase64 = data.encodedImage || null
        pixCopiaECola = data.payload || null
      }

      const newPaymentData: PaymentModalData = {
        agendamentoId,
        valor,
        qrCodeImage: qrCodeBase64,
        pixCopiaECola: pixCopiaECola,
        pixId: pagamentoId,
        expirationDate: null,
      }

      setPaymentData(newPaymentData)
      setShowPaymentModal(true)
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
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

    if (!cliente || !cliente.id) {
      alert('Erro: Você precisa estar logado como cliente')
      return
    }

    if (!formData.especialidadeId || !formData.estabelecimentoId || !formData.dataPreferencial) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const novoAgendamento: NovoAgendamento = {
      cliente_id: cliente.id,
      especialidade_id: parseInt(formData.especialidadeId),
      estabelecimento_id: parseInt(formData.estabelecimentoId),
      observacoes: formData.observacoes || null,
      valor_coparticipacao: 25.00,
    }

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
        <strong>📋 Importante:</strong> O agendamento será confirmado em até 24 horas úteis.
      </Alert>

      {showSuccessAlert && (
        <Alert variant="success">
          <strong>✓ Solicitação enviada com sucesso!</strong>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,520px)_1fr] gap-6 items-start">
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
                        : 'Selecione a especialidade'}
                    </option>
                    {especialidades?.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Informe o CEP para localizar a clínica mais próxima*
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                    />
                    <Button
                      type="button"
                      onClick={buscarCEP}
                      disabled={loadingCep || formData.cep.replace(/\D/g, '').length !== 8}
                      className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                      {loadingCep ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Search size={18} />
                          Buscar CEP
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Caso não saiba seu CEP:{' '}
                    <a
                      href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      consulte aqui
                    </a>
                    .
                  </p>

                  {cepInfo && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>CEP Digitado:</strong> {cepInfo.cep} - <strong>Endereço:</strong> {cepInfo.logradouro}, {cepInfo.bairro}, {cepInfo.localidade}/{cepInfo.uf}
                      </p>
                    </div>
                  )}

                  {cepError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{cepError}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Sugestão de Estabelecimento (opcional)
                  </label>

                  <select
                    value={formData.estabelecimentoId}
                    onChange={(e) =>
                      setFormData({ ...formData, estabelecimentoId: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    {estabelecimentosSugeridos.length === 0 ? (
                      <option value="">Nenhum estabelecimento encontrado para os filtros informados.</option>
                    ) : (
                      <>
                        <option value="">Selecione um estabelecimento</option>
                        {estabelecimentosSugeridos.map((est) => (
                          <option key={est.id} value={est.id}>
                            {est.nome} - {est.cidade}/{est.estado}
                          </option>
                        ))}
                      </>
                    )}
                  </select>

                  {cepInfo && estabelecimentosSugeridos.length === 0 && (
                    <div className="mt-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Mesmo que não haja sugestão de estabelecimentos disponíveis na sua região, nossa equipe buscará uma opção fora do nosso cadastro.</strong>
                      </p>
                      <p className="text-sm text-yellow-700">
                        Não é possível escolher um profissional específico, e a sugestão de estabelecimento não garante o agendamento, pois depende da disponibilidade e dos processos internos.
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Você pode indicar um estabelecimento de sua preferência no menu "Indicação", ajudando a ampliar nossa rede.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Data Preferencial *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dataPreferencial}
                    onChange={(e) =>
                      setFormData({ ...formData, dataPreferencial: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Período Preferencial
                  </label>
                  <select
                    value={formData.periodoPreferencial}
                    onChange={(e) =>
                      setFormData({ ...formData, periodoPreferencial: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    <option value="">Selecione o período</option>
                    <option value="manha">Manhã (08:00 - 12:00)</option>
                    <option value="tarde">Tarde (13:00 - 17:00)</option>
                    <option value="noite">Noite (18:00 - 21:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] resize-none"
                    placeholder="Informações adicionais sobre sua preferência..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createAgendamentoMutation.isPending}
                  fullWidth
                  className="py-3"
                >
                  {createAgendamentoMutation.isPending
                    ? 'Enviando...'
                    : 'Solicitar Agendamento'}
                </Button>
              </div>
            </form>
          </Card>
        </Card>

        <Card>
          <CardTitle>Informações Importantes</CardTitle>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">🏥 Valor da Coparticipação</h4>
              <p>O valor da coparticipação é de {formatCurrency(25.00)} por consulta.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📅 Confirmação</h4>
              <p>
                Sua solicitação será analisada e você receberá a confirmação com data e horário
                definidos em até 24 horas úteis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">💳 Pagamento</h4>
              <p>
                O pagamento deve ser realizado via PIX após a confirmação do agendamento. Você
                receberá um QR Code para pagamento.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">🔔 Notificações</h4>
              <p>
                Você receberá notificações por e-mail sobre o status do seu agendamento e lembretes
                antes da consulta.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* MODAL DE CONFIRMAÇÃO - ANTES DO PIX */}
      <Modal
        isOpen={showConfirmacaoModal}
        onClose={() => {
          setShowConfirmacaoModal(false)
          setConfirmouLeitura(false)
        }}
        title="Informações Importantes"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏥</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Valor da Coparticipação</h4>
                <p className="text-gray-700">
                  O valor da coparticipação é de R$ 25,00 por consulta.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          <div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📅</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Confirmação</h4>
                <p className="text-gray-700">
                  Sua solicitação será analisada e você receberá a confirmação com data e horário definidos em até 24 horas úteis.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          <div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💳</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pagamento</h4>
                <p className="text-gray-700">
                  O pagamento deve ser realizado via PIX após a confirmação do agendamento. Você receberá um QR Code para pagamento.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          <div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔔</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notificações</h4>
                <p className="text-gray-700">
                  Você receberá notificações por e-mail sobre o status do seu agendamento e lembretes antes da consulta.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* CHECKBOX */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmouLeitura}
                onChange={(e) => setConfirmouLeitura(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                <strong>Confirmo que li e compreendi todas as informações importantes acima</strong>
              </span>
            </label>
          </div>

          {/* BOTÃO CONTINUAR */}
          <Button
            onClick={continuarParaPagamento}
            disabled={!confirmouLeitura || loadingPayment}
            fullWidth
            className="py-3"
          >
            {loadingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Gerando Pagamento...
              </>
            ) : (
              <>
                <CreditCard size={20} className="mr-2" />
                Continuar para o Pagamento
              </>
            )}
          </Button>
        </div>
      </Modal>

      {/* MODAL DE PAGAMENTO PIX */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Pagamento PIX - Coparticipação"
        size="md"
      >
        {paymentData && (
          <div className="space-y-6">
            <Alert variant="info">
              <strong>💳 Realize o pagamento via PIX</strong>
              <br />
              Escaneie o QR Code ou copie o código PIX abaixo.
            </Alert>

            {paymentData.qrCodeImage && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${paymentData.qrCodeImage}`}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Valor</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(paymentData.valor)}
              </p>
            </div>

            {paymentData.pixCopiaECola && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código PIX Copia e Cola
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData.pixCopiaECola}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <Button
                    type="button"
                    onClick={copiarPixCopiaECola}
                    variant="outline"
                    size="sm"
                  >
                    {pixCopiado ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Alert variant="warning">
              <strong>⏰ Importante:</strong> Após realizar o pagamento, aguarde alguns instantes.
            </Alert>

            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
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