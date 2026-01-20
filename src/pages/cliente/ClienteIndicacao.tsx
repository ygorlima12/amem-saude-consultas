import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const ClienteIndicacao = () => {
  const { cliente } = useAuth()
  const queryClient = useQueryClient()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    nome_estabelecimento: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    especialidades: '',
    observacoes: '',
  })

  const criarIndicacaoMutation = useMutation({
    mutationFn: async (dados: typeof formData) => {
      if (!cliente?.id) throw new Error('Cliente não encontrado')
      
      return await ApiService.criarIndicacao({
        cliente_id: cliente.id,
        ...dados,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicacoes'] })
      setSubmitted(true)
      
      // Limpar formulário
      setFormData({
        nome_estabelecimento: '',
        telefone: '',
        email: '',
        endereco: '',
        cidade: '',
        estado: '',
        especialidades: '',
        observacoes: '',
      })
      
      // Esconder mensagem após 5 segundos
      setTimeout(() => setSubmitted(false), 5000)
    },
    onError: (error: any) => {
      console.error('Erro ao enviar indicação:', error)
      alert('Erro ao enviar indicação. Tente novamente.')
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    criarIndicacaoMutation.mutate(formData)
  }

  return (
    <div>
      <Alert variant="info">
        <strong>💡 Indicação de Estabelecimentos:</strong> Conhece um estabelecimento de saúde de qualidade que não está na nossa rede? 
        Indique abaixo e nossa equipe entrará em contato para análise de credenciamento.
      </Alert>

      {submitted && (
        <Alert variant="success" className="mt-4">
          <strong>✓ Indicação enviada com sucesso!</strong><br />
          Obrigado pela sua indicação. Nossa equipe irá analisá-la em breve.
        </Alert>
      )}

      <Card className="mt-6">
        <CardTitle subtitle="Preencha os dados do estabelecimento que deseja indicar">
          Indicar Estabelecimento
        </CardTitle>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block font-semibold text-text-primary mb-2 text-sm">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                name="nome_estabelecimento"
                value={formData.nome_estabelecimento}
                onChange={handleChange}
                required
                placeholder="Ex: Clínica Saúde Total"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-semibold text-text-primary mb-2 text-sm">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-2 text-sm">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contato@clinica.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-2 text-sm">
                Endereço *
              </label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                required
                placeholder="Rua, número, bairro"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-semibold text-text-primary mb-2 text-sm">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                  placeholder="São Paulo"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-2 text-sm">
                  Estado *
                </label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-2 text-sm">
                Especialidades Oferecidas *
              </label>
              <textarea
                name="especialidades"
                value={formData.especialidades}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Ex: Cardiologia, Dermatologia, Clínico Geral..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-2 text-sm">
                Observações (opcional)
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={4}
                placeholder="Informações adicionais sobre o estabelecimento..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] resize-none"
              />
            </div>

            <Button 
              type="submit" 
              fullWidth
              isLoading={criarIndicacaoMutation.isPending}
              disabled={criarIndicacaoMutation.isPending}
            >
              {criarIndicacaoMutation.isPending ? 'Enviando...' : 'Enviar Indicação'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}