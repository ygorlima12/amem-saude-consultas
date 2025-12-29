import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DollarSign, Calendar, ExternalLink } from 'lucide-react'
import { formatDate, formatCurrency } from '@/utils/format'

export const ClientePagamentos = () => {
  const pagamentos = [
    {
      id: 1,
      agendamento: 'Cardiologia - Hospital São Lucas',
      valor: 25.00,
      status: 'pago',
      dataPagamento: '2024-01-15',
      linkPagamento: null,
    },
    {
      id: 2,
      agendamento: 'Dermatologia - Clínica Saúde Total',
      valor: 25.00,
      status: 'pendente',
      dataPagamento: null,
      linkPagamento: 'https://pay.example.com/123',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
        <p className="text-gray-600">Gerencie suas coparticipações</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pago</p>
              <p className="text-xl font-bold text-gray-900">R$ 75,00</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendente</p>
              <p className="text-xl font-bold text-gray-900">R$ 25,00</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Este Mês</p>
              <p className="text-xl font-bold text-gray-900">R$ 100,00</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Histórico de Pagamentos</h2>
        <div className="space-y-3">
          {pagamentos.map((pagamento) => (
            <div
              key={pagamento.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {pagamento.agendamento}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{formatCurrency(pagamento.valor)}</span>
                  {pagamento.dataPagamento && (
                    <>
                      <span>•</span>
                      <span>Pago em {formatDate(pagamento.dataPagamento)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {pagamento.status === 'pago' ? (
                  <Badge variant="success">Pago</Badge>
                ) : (
                  <>
                    <Badge variant="warning">Pendente</Badge>
                    {pagamento.linkPagamento && (
                      <Button
                        size="sm"
                        onClick={() => window.open(pagamento.linkPagamento!, '_blank')}
                      >
                        <ExternalLink size={16} />
                        Pagar Agora
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Sobre a Coparticipação
            </h3>
            <p className="text-sm text-gray-700">
              O valor fixo de coparticipação é de <strong>R$ 25,00</strong> por consulta.
              Seu limite mensal é de <strong>R$ 400,00</strong>. Os pagamentos devem ser realizados
              antes da consulta para garantir o agendamento.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
