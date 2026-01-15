import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, X, FileText, CheckCircle } from 'lucide-react'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface FormDataConsulta {
  especialidadeId: string
  dataConsulta: string
  valorConsulta: string
  tipoPix: string
  chavePix: string
  observacoes: string
}

interface FormDataExame {
  dataNota: string
  valorNota: string
  tipoPix: string
  chavePix: string
  observacoes: string
}

export const ClienteReembolsos = () => {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Estados dos modais
  const [showModalConsulta, setShowModalConsulta] = useState(false)
  const [showModalExame, setShowModalExame] = useState(false)

  // Estados dos formulários
  const [formConsulta, setFormConsulta] = useState<FormDataConsulta>({
    especialidadeId: '',
    dataConsulta: '',
    valorConsulta: '',
    tipoPix: '',
    chavePix: '',
    observacoes: '',
  })

  const [formExame, setFormExame] = useState<FormDataExame>({
    dataNota: '',
    valorNota: '',
    tipoPix: '',
    chavePix: '',
    observacoes: '',
  })

  // Estados dos arquivos - CONSULTA
  const [arquivosConsulta, setArquivosConsulta] = useState<{
    notaFiscal: File | null
    recibo: File | null
  }>({
    notaFiscal: null,
    recibo: null,
  })

  // Estados dos arquivos - EXAME
  const [arquivosExame, setArquivosExame] = useState<{
    notaFiscal: File | null
    pedidoMedico: File | null
    documentoTitular: File | null
  }>({
    notaFiscal: null,
    pedidoMedico: null,
    documentoTitular: null,
  })

  // Buscar especialidades
  const { data: especialidades, isLoading: loadingEspecialidades } = useQuery({
    queryKey: ['especialidades'],
    queryFn: () => ApiService.getEspecialidades(),
  })

  // Mutation para criar reembolso de CONSULTA
  const criarReembolsoConsultaMutation = useMutation({
    mutationFn: async (dados: any) => {
      // 1. Criar reembolso no banco
      const reembolso = await ApiService.createReembolso(dados)

      // 2. Upload dos arquivos
      if (arquivosConsulta.notaFiscal) {
        await ApiService.uploadDocumentoReembolso(
          reembolso.id,
          arquivosConsulta.notaFiscal,
          'nota_fiscal'
        )
      }

      if (arquivosConsulta.recibo) {
        await ApiService.uploadDocumentoReembolso(
          reembolso.id,
          arquivosConsulta.recibo,
          'receita' // Usando campo receita para recibo
        )
      }

      return reembolso
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos'] })
      alert('Solicitação de reembolso enviada com sucesso! Aguarde análise da equipe.')
      setShowModalConsulta(false)
      limparFormularioConsulta()
      navigate('/cliente/historico-reembolsos')
    },
    onError: (error) => {
      console.error('Erro ao criar reembolso:', error)
      alert('Erro ao enviar solicitação. Tente novamente.')
    },
  })

  // Mutation para criar reembolso de EXAME
  const criarReembolsoExameMutation = useMutation({
    mutationFn: async (dados: any) => {
      const reembolso = await ApiService.createReembolso(dados)

      // Upload dos arquivos
      if (arquivosExame.notaFiscal) {
        await ApiService.uploadDocumentoReembolso(
          reembolso.id,
          arquivosExame.notaFiscal,
          'nota_fiscal'
        )
      }

      if (arquivosExame.pedidoMedico) {
        await ApiService.uploadDocumentoReembolso(
          reembolso.id,
          arquivosExame.pedidoMedico,
          'receita'
        )
      }

      if (arquivosExame.documentoTitular) {
        await ApiService.uploadDocumentoReembolso(
          reembolso.id,
          arquivosExame.documentoTitular,
          'relatorio'
        )
      }

      return reembolso
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos'] })
      alert('Solicitação de reembolso de exame enviada com sucesso!')
      setShowModalExame(false)
      limparFormularioExame()
      navigate('/cliente/historico-reembolsos')
    },
    onError: (error) => {
      console.error('Erro ao criar reembolso:', error)
      alert('Erro ao enviar solicitação. Tente novamente.')
    },
  })

  // Calcular estimativa de reembolso de EXAME
  const calcEstimativaExame = (valor: string) => {
    const v = Math.max(0, Number(valor || 0))
    let reembolso = 0
    if (v >= 1 && v <= 50) reembolso = v
    else if (v > 50 && v <= 500) reembolso = v * 0.4
    else if (v > 500) reembolso = 150
    reembolso = Math.min(reembolso, 150)
    return reembolso
  }

  // Calcular estimativa de reembolso de CONSULTA
  const calcEstimativaConsulta = (valor: string) => {
    const v = Math.max(0, Number(valor || 0))
    const coparticipacao = 25
    return Math.max(0, v - coparticipacao)
  }

  // Handler de arquivo
  const handleArquivoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: 'consulta' | 'exame',
    campo: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande! Tamanho máximo: 5MB')
      return
    }

    // Validar tipo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!tiposPermitidos.includes(file.type)) {
      alert('Tipo de arquivo não permitido! Use PDF, JPG ou PNG.')
      return
    }

    if (tipo === 'consulta') {
      setArquivosConsulta({ ...arquivosConsulta, [campo]: file })
    } else {
      setArquivosExame({ ...arquivosExame, [campo]: file })
    }
  }

  // Remover arquivo
  const removerArquivo = (tipo: 'consulta' | 'exame', campo: string) => {
    if (tipo === 'consulta') {
      setArquivosConsulta({ ...arquivosConsulta, [campo]: null })
    } else {
      setArquivosExame({ ...arquivosExame, [campo]: null })
    }
  }

  // Submit CONSULTA
  const handleSubmitConsulta = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cliente?.id) {
      alert('Erro: Cliente não identificado')
      return
    }

    if (!formConsulta.especialidadeId || !formConsulta.dataConsulta || !formConsulta.valorConsulta) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    if (!arquivosConsulta.recibo) {
      alert('É obrigatório anexar o recibo da consulta')
      return
    }

    const dadosReembolso = {
      cliente_id: cliente.id,
      tipo: 'consulta',
      especialidade_id: parseInt(formConsulta.especialidadeId),
      data_atendimento: formConsulta.dataConsulta,
      valor_total: parseFloat(formConsulta.valorConsulta),
      valor_estimado: calcEstimativaConsulta(formConsulta.valorConsulta),
      tipo_pix: formConsulta.tipoPix,
      chave_pix: formConsulta.chavePix,
      observacoes: formConsulta.observacoes || null,
      status: 'pendente',
      data_solicitacao: new Date().toISOString(),
    }

    criarReembolsoConsultaMutation.mutate(dadosReembolso)
  }

  // Submit EXAME
  const handleSubmitExame = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cliente?.id) {
      alert('Erro: Cliente não identificado')
      return
    }

    if (!formExame.dataNota || !formExame.valorNota) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    if (!arquivosExame.notaFiscal || !arquivosExame.pedidoMedico) {
      alert('É obrigatório anexar a nota fiscal e o pedido médico')
      return
    }

    const dadosReembolso = {
      cliente_id: cliente.id,
      tipo: 'exame',
      data_atendimento: formExame.dataNota,
      valor_total: parseFloat(formExame.valorNota),
      valor_estimado: calcEstimativaExame(formExame.valorNota),
      tipo_pix: formExame.tipoPix,
      chave_pix: formExame.chavePix,
      observacoes: formExame.observacoes || null,
      status: 'pendente',
      data_solicitacao: new Date().toISOString(),
    }

    criarReembolsoExameMutation.mutate(dadosReembolso)
  }

  // Limpar formulários
  const limparFormularioConsulta = () => {
    setFormConsulta({
      especialidadeId: '',
      dataConsulta: '',
      valorConsulta: '',
      tipoPix: '',
      chavePix: '',
      observacoes: '',
    })
    setArquivosConsulta({
      notaFiscal: null,
      recibo: null,
    })
  }

  const limparFormularioExame = () => {
    setFormExame({
      dataNota: '',
      valorNota: '',
      tipoPix: '',
      chavePix: '',
      observacoes: '',
    })
    setArquivosExame({
      notaFiscal: null,
      pedidoMedico: null,
      documentoTitular: null,
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid gap-4 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reembolsos</h1>
          <hr className="my-2" />
          <p className="text-gray-600">Solicite reembolso de consultas e exames</p>
        </div>

        <div className="grid gap-4 col-span-1 md:grid-cols-2">
          <div
            className="bg-blue-50 border relative p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowModalConsulta(true)}
          >
            <h2 className="text-lg font-semibold text-blue-900">Reembolso de Consulta</h2>
            <p className="text-sm text-gray-600 mt-2">
              Envie nota fiscal e dados para análise conforme regras do plano.
            </p>
          </div>

          <div
            className="bg-blue-50 border relative p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowModalExame(true)}
          >
            <h2 className="text-lg font-semibold text-blue-900">Reembolso de Exame</h2>
            <p className="text-sm text-gray-600 mt-2">
              Envie nota fiscal e dados para análise conforme regras do plano.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Consulta */}
      <Modal
        isOpen={showModalConsulta}
        onClose={() => setShowModalConsulta(false)}
        title="Solicitar Reembolso de Consulta"
        size="xl"
      >
        <form onSubmit={handleSubmitConsulta} className="space-y-4">
          <div className="bg-teal-50 border-l-4 border-teal-500 rounded-xl p-6">
            <strong>Procedimento Operacional – Reembolso de Consulta</strong>
            <p className="mt-2 text-sm">Leia com atenção antes de enviar seus documentos.</p>
          </div>

          {/* Especialidade */}
          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Especialidade *
            </label>
            <select
              required
              value={formConsulta.especialidadeId}
              onChange={(e) => setFormConsulta({ ...formConsulta, especialidadeId: e.target.value })}
              disabled={loadingEspecialidades}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm"
            >
              <option value="">
                {loadingEspecialidades ? 'Carregando...' : 'Selecione a especialidade'}
              </option>
              {especialidades?.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Data da Consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Consulta *
            </label>
            <input
              required
              type="date"
              value={formConsulta.dataConsulta}
              onChange={(e) => setFormConsulta({ ...formConsulta, dataConsulta: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <span className="text-xs text-gray-500">A data deve ser dentro dos últimos 10 dias.</span>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Consulta (R$) *
            </label>
            <input
              required
              type="number"
              step="0.01"
              value={formConsulta.valorConsulta}
              onChange={(e) => setFormConsulta({ ...formConsulta, valorConsulta: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="0,00"
            />

            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-xl p-5 mt-4">
              <strong className="text-sm text-gray-700">Valor estimado de reembolso</strong>
              <br />
              <span className="text-xs text-gray-500">
                Estimativa: valor da consulta menos coparticipação (R$ 25,00)
              </span>
              <div className="text-3xl font-bold text-teal-500 mt-2">
                R$ {calcEstimativaConsulta(formConsulta.valorConsulta).toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* PIX */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de chave PIX *</label>
            <select
              required
              value={formConsulta.tipoPix}
              onChange={(e) => setFormConsulta({ ...formConsulta, tipoPix: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecione...</option>
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
              <option value="telefone">Telefone</option>
              <option value="chavealeatoria">Chave Aleatória</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chave PIX *</label>
            <input
              required
              type="text"
              value={formConsulta.chavePix}
              onChange={(e) => setFormConsulta({ ...formConsulta, chavePix: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Insira sua chave PIX"
            />
          </div>

          {/* Upload Nota Fiscal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota Fiscal (PDF ou JPG até 5MB)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleArquivoChange(e, 'consulta', 'notaFiscal')}
              className="hidden"
              id="nota-fiscal-consulta"
            />
            <label
              htmlFor="nota-fiscal-consulta"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors cursor-pointer block"
            >
              {arquivosConsulta.notaFiscal ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-sm text-gray-700">{arquivosConsulta.notaFiscal.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removerArquivo('consulta', 'notaFiscal')
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 text-gray-400" size={22} />
                  <p className="text-sm text-gray-600">Clique para fazer upload</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG ou PNG até 5MB</p>
                </>
              )}
            </label>
          </div>

          {/* Upload Recibo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recibo (PDF ou JPG até 5MB) *
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleArquivoChange(e, 'consulta', 'recibo')}
              className="hidden"
              id="recibo-consulta"
            />
            <label
              htmlFor="recibo-consulta"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors cursor-pointer block"
            >
              {arquivosConsulta.recibo ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-sm text-gray-700">{arquivosConsulta.recibo.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removerArquivo('consulta', 'recibo')
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 text-gray-400" size={22} />
                  <p className="text-sm text-gray-600">Clique para fazer upload</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG ou PNG até 5MB</p>
                </>
              )}
            </label>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              rows={3}
              value={formConsulta.observacoes}
              onChange={(e) => setFormConsulta({ ...formConsulta, observacoes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Informações adicionais..."
            />
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Atenção:</strong> O prazo para análise é de até 10 dias úteis. Certifique-se de
              anexar todos os documentos necessários.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModalConsulta(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={criarReembolsoConsultaMutation.isPending}>
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Exame */}
      <Modal
        isOpen={showModalExame}
        onClose={() => setShowModalExame(false)}
        title="Solicitar Reembolso de Exame"
        size="xl"
      >
        <form onSubmit={handleSubmitExame} className="space-y-4">
          <div className="bg-teal-50 border-l-4 border-teal-500 rounded-xl p-6">
            <strong>Regras principais</strong>
            <ul className="mt-2 pl-4 list-disc text-sm">
              <li>Nota fiscal emitida há no máximo 10 dias.</li>
              <li>Pedido médico legível (PDF ou JPG).</li>
              <li>Reembolso: 100% até R$ 50 | 40% de R$ 50,01 a R$ 500 | acima de R$ 500 = R$ 150.</li>
              <li>Um pedido por mês. Pagamento via PIX.</li>
            </ul>
          </div>

          {/* Data e Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data da Nota Fiscal *</label>
            <input
              required
              type="date"
              value={formExame.dataNota}
              onChange={(e) => setFormExame({ ...formExame, dataNota: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Nota Fiscal (R$) *
            </label>
            <input
              required
              type="number"
              step="0.01"
              value={formExame.valorNota}
              onChange={(e) => setFormExame({ ...formExame, valorNota: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="0,00"
            />

            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-xl p-5 mt-4">
              <strong className="text-sm text-gray-700">Valor estimado de reembolso</strong>
              <div className="text-3xl font-bold text-teal-500 mt-2">
                R$ {calcEstimativaExame(formExame.valorNota).toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* PIX */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de chave PIX *</label>
            <select
              required
              value={formExame.tipoPix}
              onChange={(e) => setFormExame({ ...formExame, tipoPix: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecione...</option>
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
              <option value="telefone">Telefone</option>
              <option value="chavealeatoria">Chave Aleatória</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chave PIX *</label>
            <input
              required
              type="text"
              value={formExame.chavePix}
              onChange={(e) => setFormExame({ ...formExame, chavePix: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Insira sua chave PIX"
            />
          </div>

          {/* Uploads */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota Fiscal * (PDF ou JPG até 5MB)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleArquivoChange(e, 'exame', 'notaFiscal')}
              className="hidden"
              id="nota-fiscal-exame"
            />
            <label
              htmlFor="nota-fiscal-exame"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors cursor-pointer block"
            >
              {arquivosExame.notaFiscal ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-sm text-gray-700">{arquivosExame.notaFiscal.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removerArquivo('exame', 'notaFiscal')
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 text-gray-400" size={22} />
                  <p className="text-sm text-gray-600">Clique para fazer upload</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG ou PNG até 5MB</p>
                </>
              )}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pedido Médico * (PDF ou JPG até 5MB)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleArquivoChange(e, 'exame', 'pedidoMedico')}
              className="hidden"
              id="pedido-medico"
            />
            <label
              htmlFor="pedido-medico"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors cursor-pointer block"
            >
              {arquivosExame.pedidoMedico ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-sm text-gray-700">{arquivosExame.pedidoMedico.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removerArquivo('exame', 'pedidoMedico')
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 text-gray-400" size={22} />
                  <p className="text-sm text-gray-600">Clique para fazer upload</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG ou PNG até 5MB</p>
                </>
              )}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento do Titular (opcional)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleArquivoChange(e, 'exame', 'documentoTitular')}
              className="hidden"
              id="documento-titular"
            />
            <label
              htmlFor="documento-titular"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors cursor-pointer block"
            >
              {arquivosExame.documentoTitular ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-sm text-gray-700">{arquivosExame.documentoTitular.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removerArquivo('exame', 'documentoTitular')
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 text-gray-400" size={22} />
                  <p className="text-sm text-gray-600">Clique para fazer upload</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG ou PNG até 5MB</p>
                </>
              )}
            </label>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              rows={3}
              value={formExame.observacoes}
              onChange={(e) => setFormExame({ ...formExame, observacoes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Informações adicionais..."
            />
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Atenção:</strong> O prazo para análise é de até 10 dias úteis.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModalExame(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={criarReembolsoExameMutation.isPending}>
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}