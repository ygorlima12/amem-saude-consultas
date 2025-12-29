import { useAuth } from '@/hooks/useAuth'
import { Carousel } from '@/components/ui/Carousel'
import { useNavigate } from 'react-router-dom'

export const ClienteDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const firstName = user?.nome.split(' ')[0] || 'Beneficiário'

  const carouselCards = [
    {
      title: '📅 Solicitar Agendamento',
      description: 'Agende suas consultas de forma rápida e prática. Escolha a especialidade e o local mais próximo de você.',
      onClick: () => navigate('/cliente/solicitar-agendamento'),
    },
    {
      title: '📋 Meus Agendamentos',
      description: 'Visualize todos os seus agendamentos confirmados e o histórico de consultas realizadas.',
      onClick: () => navigate('/cliente/agendamentos'),
    },
    {
      title: '💰 Coparticipação',
      description: 'Consulte os valores de coparticipação das suas consultas e realize pagamentos online.',
      onClick: () => navigate('/cliente/pagamentos'),
    },
    {
      title: '📄 Guias de Atendimento',
      description: 'Acesse e faça download das suas guias de atendimento autorizadas.',
      onClick: () => navigate('/cliente/guias'),
    },
    {
      title: '💵 Solicitar Reembolso',
      description: 'Solicite o reembolso de consultas e exames realizados fora da rede credenciada.',
      onClick: () => navigate('/cliente/reembolsos'),
    },
  ]

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-primary text-white p-12 rounded-card text-center mb-10">
        <h1 className="text-5xl font-extrabold mb-2.5">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-lg opacity-90">
          Bem-vindo ao seu portal de saúde. Aqui você pode gerenciar seus agendamentos, acessar guias e muito mais.
        </p>
      </div>

      {/* Carousel */}
      <Carousel
        title="O que você pode fazer aqui?"
        cards={carouselCards}
      />

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white rounded-card p-6 shadow-card text-center">
          <div className="text-4xl mb-3">🏥</div>
          <h3 className="font-bold text-lg text-secondary-900 mb-2">
            Rede Credenciada
          </h3>
          <p className="text-sm text-text-secondary">
            Acesso a diversos estabelecimentos de saúde credenciados em sua região
          </p>
        </div>

        <div className="bg-white rounded-card p-6 shadow-card text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="font-bold text-lg text-secondary-900 mb-2">
            Atendimento Rápido
          </h3>
          <p className="text-sm text-text-secondary">
            Agendamento simplificado e confirmação em até 24 horas úteis
          </p>
        </div>

        <div className="bg-white rounded-card p-6 shadow-card text-center">
          <div className="text-4xl mb-3">💳</div>
          <h3 className="font-bold text-lg text-secondary-900 mb-2">
            Coparticipação Facilitada
          </h3>
          <p className="text-sm text-text-secondary">
            Pagamento online de coparticipação de forma segura e prática
          </p>
        </div>
      </div>
    </div>
  )
}
