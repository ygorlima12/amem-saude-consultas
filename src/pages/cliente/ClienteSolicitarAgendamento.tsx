import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export const ClienteSolicitarAgendamento = () => {
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
        <strong>📋 Importante:</strong> O agendamento será confirmado em até 24 horas úteis. 
        Você receberá uma notificação por e-mail e poderá acompanhar o status em "Meus Agendamentos".
      </Alert>

      {submitted && (
        <Alert variant="info">
          <strong>✓ Solicitação enviada com sucesso!</strong><br />
          Sua solicitação de agendamento foi recebida. Você receberá um e-mail com a confirmação em breve.
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
                    Especialidade Médica
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    <option value="">Selecione a especialidade</option>
                    <option value="1">Clínico Geral</option>
                    <option value="2">Cardiologia</option>
                    <option value="3">Dermatologia</option>
                    <option value="4">Pediatria</option>
                    <option value="5">Ginecologia</option>
                    <option value="6">Ortopedia</option>
                    <option value="7">Oftalmologia</option>
                    <option value="8">Psicologia</option>
                    <option value="9">Nutrição</option>
                    <option value="10">Fisioterapia</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Estabelecimento
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    <option value="">Selecione o estabelecimento</option>
                    <option value="1">Clínica Saúde Plena - Centro</option>
                    <option value="2">Hospital São Lucas - Zona Sul</option>
                    <option value="3">Policlínica Vida - Zona Norte</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Data Preferencial
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Período Preferencial
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)]"
                  >
                    <option value="">Selecione</option>
                    <option value="manha">Manhã (08:00 - 12:00)</option>
                    <option value="tarde">Tarde (13:00 - 17:00)</option>
                    <option value="noite">Noite (18:00 - 21:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-2 text-sm">
                    Observações (opcional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descreva aqui informações adicionais sobre o agendamento..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] resize-none"
                  />
                </div>

                <Button type="submit" fullWidth>
                  Enviar Solicitação
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
    </div>
  )
}
