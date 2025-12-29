import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export const ClienteIndicacao = () => {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar envio para Supabase
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div>
      <Alert variant="info">
        <strong>💡 Indicação de Estabelecimentos:</strong> Conhece um estabelecimento de saúde de qualidade que não está na nossa rede? 
        Indique abaixo e nossa equipe entrará em contato para análise de credenciamento.
      </Alert>

      {submitted && (
        <Alert variant="info">
          <strong>✓ Indicação enviada com sucesso!</strong><br />
          Obrigado pela sua indicação. Nossa equipe irá analisá-la em breve.
        </Alert>
      )}

      <Card>
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
                  required
                  placeholder="São Paulo"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-2 text-sm">
                  Estado *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                >
                  <option value="">Selecione</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  {/* Add more states */}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-2 text-sm">
                Especialidades Oferecidas *
              </label>
              <textarea
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
                rows={4}
                placeholder="Informações adicionais sobre o estabelecimento..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] resize-none"
              />
            </div>

            <Button type="submit" fullWidth>
              Enviar Indicação
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
