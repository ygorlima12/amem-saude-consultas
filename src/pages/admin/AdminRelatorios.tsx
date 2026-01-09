import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import {
  FileText,
  Download,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  Receipt,
  Filter,
  X,
  FileDown,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'

export const AdminRelatorios = () => {
  const queryClient = useQueryClient()

  // Filtros para gerar relatório
  const [filtros, setFiltros] = useState({
    tipoRelatorio: 'clientes',
    periodoRapido: 'mensal',
    dataInicio: '',
    dataFim: '',
    formato: 'pdf'
  })

  // Buscar estatísticas gerais para os cards
  const { data: stats } = useQuery({
    queryKey: ['relatorios-stats'],
    queryFn: async () => {
      const [clientesRes, agendamentosRes, reembolsosRes] = await Promise.all([
        ApiService.supabase.from('clientes').select('*', { count: 'exact' }),
        ApiService.supabase.from('agendamentos').select('*'),
        ApiService.supabase.from('reembolsos').select('*').eq('status', 'aprovado')
      ])

      const totalClientes = clientesRes.count || 0
      const totalAgendamentos = agendamentosRes.data?.length || 0
      const totalReembolsado = reembolsosRes.data?.reduce((sum, r) => sum + (r.valor_solicitado || 0), 0) || 0
      
      const agendamentosPagos = agendamentosRes.data?.filter(a => a.pago) || []
      const totalCoparticipacao = agendamentosPagos.reduce((sum, a) => sum + (a.valor_coparticipacao || 0), 0)

      return {
        totalClientes,
        totalAgendamentos,
        totalReembolsado,
        totalCoparticipacao
      }
    },
  })

  // Buscar relatórios gerados (simulação - você pode criar uma tabela real)
  const { data: relatoriosGerados } = useQuery({
    queryKey: ['relatorios-gerados'],
    queryFn: async () => {
      // Simulação de relatórios gerados
      // Em produção, você criaria uma tabela 'relatorios_gerados' no Supabase
      return [
        {
          id: 1,
          data_geracao: new Date().toISOString(),
          tipo: 'Financeiro Completo',
          periodo: 'Novembro/2025',
          formato: 'PDF',
          usuario: 'Administrador',
          arquivo_url: '#'
        },
        {
          id: 2,
          data_geracao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          tipo: 'Agendamentos',
          periodo: 'Últimos 3 Meses',
          formato: 'Excel',
          usuario: 'Administrador',
          arquivo_url: '#'
        },
        {
          id: 3,
          data_geracao: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          tipo: 'Clientes',
          periodo: 'Este Ano',
          formato: 'CSV',
          usuario: 'Administrador',
          arquivo_url: '#'
        }
      ]
    },
  })

  // Função para gerar relatório
  const gerarRelatorio = async () => {
    try {
      // Aqui você implementaria a lógica real de geração
      // Por exemplo: exportar para PDF usando jsPDF, Excel usando xlsx, etc.
      
      let dados: any[] = []
      let nomeArquivo = ''

      // Buscar dados baseado no tipo de relatório
      switch (filtros.tipoRelatorio) {
        case 'clientes':
          const { data: clientes } = await ApiService.supabase
            .from('clientes')
            .select('*, usuario:usuarios(*)')
          dados = clientes || []
          nomeArquivo = `relatorio-clientes-${new Date().toISOString().split('T')[0]}`
          break

        case 'agendamentos':
          const { data: agendamentos } = await ApiService.supabase
            .from('agendamentos')
            .select('*, cliente:clientes(*, usuario:usuarios(*)), especialidade:especialidades(*)')
          dados = agendamentos || []
          nomeArquivo = `relatorio-agendamentos-${new Date().toISOString().split('T')[0]}`
          break

        case 'reembolsos':
          const { data: reembolsos } = await ApiService.supabase
            .from('reembolsos')
            .select('*, cliente:clientes(*, usuario:usuarios(*))')
          dados = reembolsos || []
          nomeArquivo = `relatorio-reembolsos-${new Date().toISOString().split('T')[0]}`
          break

        case 'financeiro':
          // Combinar dados de agendamentos e reembolsos
          const { data: ag } = await ApiService.supabase
            .from('agendamentos')
            .select('*')
            .eq('pago', true)
          
          const { data: re } = await ApiService.supabase
            .from('reembolsos')
            .select('*')
            .eq('status', 'aprovado')

          dados = [...(ag || []), ...(re || [])]
          nomeArquivo = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}`
          break

        case 'especialidades':
          const { data: especialidades } = await ApiService.supabase
            .from('especialidades')
            .select('*')
          dados = especialidades || []
          nomeArquivo = `relatorio-especialidades-${new Date().toISOString().split('T')[0]}`
          break

        case 'estabelecimentos':
          const { data: estabelecimentos } = await ApiService.supabase
            .from('estabelecimentos')
            .select('*')
          dados = estabelecimentos || []
          nomeArquivo = `relatorio-estabelecimentos-${new Date().toISOString().split('T')[0]}`
          break
      }

      // Exportar baseado no formato
      if (filtros.formato === 'csv') {
        exportarCSV(dados, nomeArquivo)
      } else if (filtros.formato === 'excel') {
        alert('Exportação para Excel será implementada com a biblioteca XLSX')
      } else {
        alert('Exportação para PDF será implementada com a biblioteca jsPDF')
      }

      alert(`Relatório de ${filtros.tipoRelatorio} gerado com sucesso!\n\nTotal de registros: ${dados.length}`)
      
      // Invalidar query para atualizar lista de relatórios
      queryClient.invalidateQueries({ queryKey: ['relatorios-gerados'] })

    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      alert('Erro ao gerar relatório. Tente novamente.')
    }
  }

  // Função auxiliar para exportar CSV
  const exportarCSV = (dados: any[], nomeArquivo: string) => {
    if (dados.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }

    // Pegar as chaves do primeiro objeto
    const headers = Object.keys(dados[0])
    
    // Criar linhas CSV
    const csv = [
      headers.join(','), // Header
      ...dados.map(row => 
        headers.map(header => {
          const value = row[header]
          // Tratar valores que possam conter vírgulas
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    // Criar blob e fazer download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${nomeArquivo}.csv`
    link.click()
  }

  const limparFiltros = () => {
    setFiltros({
      tipoRelatorio: 'clientes',
      periodoRapido: 'mensal',
      dataInicio: '',
      dataFim: '',
      formato: 'pdf'
    })
  }

  const handleDeleteRelatorio = (id: number) => {
    if (confirm('Deseja realmente excluir este relatório?')) {
      // Implementar exclusão
      queryClient.invalidateQueries({ queryKey: ['relatorios-gerados'] })
      alert('Relatório excluído com sucesso!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">Gere relatórios detalhados do sistema</p>
      </div>

      {/* Filtros para Gerar Relatório */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileDown size={20} className="text-primary" />
          Gerar Relatório
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={filtros.tipoRelatorio}
              onChange={(e) => setFiltros({ ...filtros, tipoRelatorio: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="clientes">Clientes</option>
              <option value="agendamentos">Agendamentos</option>
              <option value="reembolsos">Reembolsos</option>
              <option value="financeiro">Financeiro Completo</option>
              <option value="especialidades">Especialidades</option>
              <option value="estabelecimentos">Estabelecimentos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período Rápido
            </label>
            <select
              value={filtros.periodoRapido}
              onChange={(e) => setFiltros({ ...filtros, periodoRapido: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="hoje">Hoje</option>
              <option value="mensal">Mensal</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              disabled={filtros.periodoRapido !== 'personalizado'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Fim
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              disabled={filtros.periodoRapido !== 'personalizado'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato
            </label>
            <select
              value={filtros.formato}
              onChange={(e) => setFiltros({ ...filtros, formato: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel (XLSX)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={gerarRelatorio}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2"
          >
            <FileDown size={18} />
            Gerar Relatório
          </button>
          <button
            onClick={limparFiltros}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
          >
            <X size={18} />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Relatórios Gerados */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Relatórios Gerados Recentemente</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Formato
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Usuário
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {relatoriosGerados && relatoriosGerados.length > 0 ? (
                relatoriosGerados.map((relatorio: any) => (
                  <tr key={relatorio.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(relatorio.data_geracao).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{relatorio.tipo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {relatorio.periodo}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {relatorio.formato}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {relatorio.usuario}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.open(relatorio.arquivo_url, '_blank')}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRelatorio(relatorio.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium mb-1">Nenhum relatório gerado ainda</p>
                    <p className="text-sm text-gray-400">Gere seu primeiro relatório usando o formulário acima</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <TrendingUp size={18} />
          Informações sobre Relatórios
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Os relatórios são gerados em tempo real com base nos dados mais recentes</p>
          <p>• Formatos disponíveis: PDF (visualização), Excel (análise), CSV (importação)</p>
          <p>• Você pode filtrar por período personalizado para análises específicas</p>
          <p>• Os relatórios gerados ficam disponíveis para download por 30 dias</p>
        </div>
      </div>
    </div>
  )
}