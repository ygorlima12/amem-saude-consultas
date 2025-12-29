import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FileText, Download } from 'lucide-react'

export const ClienteGuias = () => {
  // Mock data
  const guias = [
    {
      id: 1,
      numero: 'GU-2024-001234',
      tipo: 'Consulta',
      especialidade: 'Cardiologia',
      data_emissao: '2024-01-15',
      validade: '2024-02-15',
      status: 'ativa',
    },
    {
      id: 2,
      numero: 'GU-2024-001235',
      tipo: 'Exame',
      especialidade: 'Laboratório',
      data_emissao: '2024-01-10',
      validade: '2024-01-25',
      status: 'utilizada',
    },
  ]

  return (
    <div>
      <Card>
        <CardTitle subtitle="Aqui você encontra todas as guias autorizadas para consultas e exames">
          Guias de Atendimento
        </CardTitle>

        {guias.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2.5">
              Nenhuma guia disponível
            </h3>
            <p className="text-sm text-text-secondary">
              Você ainda não possui guias autorizadas
            </p>
          </div>
        ) : (
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
                {guias.map((guia) => (
                  <tr key={guia.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <span className="font-medium">{guia.numero}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                      {guia.tipo}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                      {guia.especialidade}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                      {new Date(guia.data_emissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                      {new Date(guia.validade).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                      <Badge variant={guia.status === 'ativa' ? 'success' : 'neutral'}>
                        {guia.status === 'ativa' ? 'ATIVA' : 'UTILIZADA'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm align-middle">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download size={18} className="text-primary" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
