import { Card, CardTitle } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export const ClienteAjuda = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      pergunta: 'Como solicitar um agendamento?',
      resposta: 'Acesse o menu "Solicitar Agendamento", escolha a especialidade médica desejada, selecione o estabelecimento e a data preferencial. Após enviar a solicitação, você receberá uma confirmação em até 24 horas úteis.',
    },
    {
      pergunta: 'Qual o valor da coparticipação?',
      resposta: 'O valor padrão da coparticipação é de R$ 25,00 por consulta. Valores diferentes podem ser aplicados conforme a especialidade médica. Você pode consultar os valores na página "Coparticipação".',
    },
    {
      pergunta: 'Como fazer o pagamento da coparticipação?',
      resposta: 'Após a confirmação do agendamento, acesse "Coparticipação" no menu. Você poderá visualizar os valores pendentes e realizar o pagamento online de forma segura.',
    },
    {
      pergunta: 'Posso cancelar um agendamento?',
      resposta: 'Sim! Acesse o menu "Cancelar Agendamento", selecione o agendamento que deseja cancelar e confirme. Lembre-se de fazer o cancelamento com antecedência mínima de 24 horas.',
    },
    {
      pergunta: 'Como solicitar reembolso?',
      resposta: 'Acesse "Solicitar Reembolso" no menu, escolha o tipo (consulta ou exame), preencha os dados e anexe os documentos necessários. Nossa equipe analisará sua solicitação em até 15 dias úteis.',
    },
    {
      pergunta: 'Onde encontro minhas guias de atendimento?',
      resposta: 'As guias autorizadas estão disponíveis no menu "Guias de Atendimento". Você pode visualizar e fazer download das guias ativas para apresentar no estabelecimento de saúde.',
    },
    {
      pergunta: 'Como atualizar meus dados cadastrais?',
      resposta: 'Acesse "Meus Dados" no menu, clique em "Editar Dados", faça as alterações necessárias e salve. Seus dados serão atualizados imediatamente no sistema.',
    },
    {
      pergunta: 'Como indicar um estabelecimento?',
      resposta: 'Se você conhece um estabelecimento de qualidade que não está na nossa rede, acesse "Indicar Estabelecimento" e preencha o formulário com os dados. Nossa equipe entrará em contato para análise.',
    },
  ]

  return (
    <div>
      <Alert variant="info">
        <strong>💬 Precisa de ajuda?</strong> Encontre respostas para as perguntas mais frequentes abaixo.
        Se não encontrar o que procura, entre em contato conosco pelo e-mail: suporte@amemsaude.com.br
      </Alert>

      <Card>
        <CardTitle subtitle="Perguntas frequentes sobre o uso do portal">
          Central de Ajuda
        </CardTitle>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span className="font-semibold text-text-primary">
                  {faq.pergunta}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-primary transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 py-4 bg-white border-t border-gray-200">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {faq.resposta}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
          <h3 className="font-bold text-lg text-secondary-900 mb-2">
            Ainda precisa de ajuda?
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Entre em contato conosco através dos canais abaixo:
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <strong>E-mail:</strong> suporte@amemsaude.com.br
            </p>
            <p>
              <strong>Telefone:</strong> (11) 3000-0000
            </p>
            <p>
              <strong>Horário de atendimento:</strong> Segunda a Sexta, das 8h às 18h
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
