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
      <div className="bg-gradient-primary text-white p-10 sm:p-14 rounded-card text-center mb-10 shadow-card-hover overflow-hidden relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-base sm:text-lg opacity-95 max-w-2xl mx-auto">
            Bem-vindo ao seu portal de saúde. Aqui você pode gerenciar seus agendamentos, acessar guias e muito mais.
          </p>
        </div>
      </div>

      {/* Carousel */}
      <Carousel
        title="O que você pode fazer aqui?"
        cards={carouselCards}
      />

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
        {[
          {
            icon: '🏥',
            title: 'Rede Credenciada',
            description: 'Acesso a diversos estabelecimentos de saúde credenciados em sua região',
          },
          {
            icon: '⚡',
            title: 'Atendimento Rápido',
            description: 'Agendamento simplificado e confirmação em até 24 horas úteis',
          },
          {
            icon: '💳',
            title: 'Coparticipação Facilitada',
            description: 'Pagamento online de coparticipação de forma segura e prática',
          },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-card p-6 shadow-card text-center hover:shadow-card-hover transition-all duration-250 border border-gray-100/50 group"
          >
            <div className="text-5xl mb-4 transition-transform duration-250 group-hover:scale-110">
              {item.icon}
            </div>
            <h3 className="font-bold text-lg text-secondary-900 mb-2.5">
              {item.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
