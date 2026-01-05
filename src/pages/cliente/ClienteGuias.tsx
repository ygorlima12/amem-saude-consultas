import { useQuery } from '@tanstack/react-query'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FileText, Download } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/api.service'
import { formatDate } from '@/utils/format'

export const ClienteGuias = () => {
  const { cliente } = useAuth()

  const { data: guias, isLoading } = useQuery({
    queryKey: ['guias', cliente?.id],
    queryFn: () => ApiService.getGuiasCliente(cliente!.id),
    enabled: !!cliente?.id,
  })

  const getStatusGuia = (validade: string | null) => {
    if (!validade) return 'ativa'
    const hoje = new Date()
    const dataValidade = new Date(validade)
    return dataValidade >= hoje ? 'ativa' : 'vencida'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <Card>
        <CardTitle subtitle="Aqui você encontra todas as guias autorizadas para consultas e exames">
          Guias de Atendimento
        </CardTitle>

        {guias && guias.length > 0 ? (
          <div className="overflow-x-auto rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <table className="w-full border-collapse bg-white min-w-[720px]">
              <thead className="bg-secondary-900 text-white">
                <tr>
                  <th className="px-4 py-3.5 text-left font-bold text-xs tracking-[0.5px] uppercase">
                    Número da Guia
                  </th>
                  <th className="px-4 py-3.5 text-left font-bold text-xs tracking-[0.5px] uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3.5 text-left font-bold text-xs tracking-[0.5px] uppercase">
                    Especialidade
                  </th>
                  <th className="px-4 py-3.5 text-left font-bold text-xs tracking-[0.5px] uppercase">
                    Data Emissão
                  </th>
                  <th className="px-4 py-3.5 text-left font-bold text-xs tracking-[0.5px] uppercase">
                    Validade
                  </th>
                  <th className="px-4 py-3.5 text-left font-bold text-xs tracking-[0.5px] uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left font-bold text-xs tracking-[0.5px] uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {guias.map((guia: any) => {
                  const status = getStatusGuia(guia.validade)
                  return (
                    <tr key={guia.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-primary" />
                          <span className="font-medium">{guia.numero_guia}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle capitalize">
                        {guia.tipo}
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                        {guia.agendamento?.especialidade?.nome || 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                        {formatDate(guia.data_emissao)}
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                        {guia.validade ? formatDate(guia.validade) : 'Sem validade'}
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                        <Badge variant={status === 'ativa' ? 'success' : 'danger'}>
                          {status === 'ativa' ? 'ATIVA' : 'VENCIDA'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => {
                            if (guia.arquivo_url) {
                              window.open(guia.arquivo_url, '_blank')
                            } else {
                              alert('Arquivo não disponível')
                            }
                          }}
                        >
                          <Download size={18} className="text-primary" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2.5">
              Nenhuma guia disponível
            </h3>
            <p className="text-sm text-text-secondary">
              Você ainda não possui guias autorizadas. As guias serão geradas automaticamente após a
              confirmação dos agendamentos.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}