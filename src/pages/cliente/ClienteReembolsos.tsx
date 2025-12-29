import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { FileText, Plus, Upload } from 'lucide-react'
import { formatDate, formatCurrency, getStatusLabel } from '@/utils/format'

export const ClienteReembolsos = () => {
  const [showModal, setShowModal] = useState(false)

  const reembolsos = [
    {
      id: 1,
      tipo: 'consulta',
      valorSolicitado: 150.00,
      valorAprovado: 120.00,
      status: 'aprovado',
      dataSolicitacao: '2024-01-10',
      dataAprovacao: '2024-01-15',
    },
    {
      id: 2,
      tipo: 'exame',
      valorSolicitado: 250.00,
      valorAprovado: null,
      status: 'pendente',
      dataSolicitacao: '2024-01-20',
      dataAprovacao: null,
    },
  ]

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'warning',
      aprovado: 'success',
      recusado: 'danger',
      pago: 'info',
    }
    return variants[status] || 'default'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reembolsos</h1>
          <p className="text-gray-600">Solicite reembolso de consultas e exames</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Solicitar Reembolso
        </Button>
      </div>

      <div className="grid gap-4">
        {reembolsos.map((reembolso) => (
          <Card key={reembolso.id}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FileText size={20} className="text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    Reembolso de {reembolso.tipo}
                  </h3>
                  <Badge variant={getStatusVariant(reembolso.status)}>
                    {getStatusLabel(reembolso.status)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>Valor solicitado: <strong>{formatCurrency(reembolso.valorSolicitado)}</strong></p>
                  {reembolso.valorAprovado && (
                    <p>Valor aprovado: <strong className="text-green-600">{formatCurrency(reembolso.valorAprovado)}</strong></p>
                  )}
                  <p>Solicitado em: {formatDate(reembolso.dataSolicitacao)}</p>
                  {reembolso.dataAprovacao && (
                    <p>Aprovado em: {formatDate(reembolso.dataAprovacao)}</p>
                  )}
                </div>
              </div>

              <Button size="sm" variant="outline">
                Ver Detalhes
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Solicitar Reembolso"
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reembolso
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>Selecione...</option>
              <option value="consulta">Consulta</option>
              <option value="exame">Exame</option>
            </select>
          </div>

          <Input
            type="number"
            label="Valor Solicitado"
            placeholder="0.00"
            step="0.01"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos (Recibos, Notas Fiscais)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm text-gray-600">
                Clique para fazer upload ou arraste os arquivos
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG ou PNG até 5MB
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Informações adicionais sobre o reembolso..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Atenção:</strong> O prazo para análise é de até 10 dias úteis.
              Certifique-se de anexar todos os documentos necessários.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
