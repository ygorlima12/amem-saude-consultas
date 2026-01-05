import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { ApiService } from '@/services/api.service'

export const AdminClientes = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['admin-clientes'],
    queryFn: () => ApiService.getAllClientes(),
  })

  const filteredClientes = clientes?.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      cliente.usuario?.nome?.toLowerCase().includes(searchLower) ||
      cliente.usuario?.email?.toLowerCase().includes(searchLower) ||
      cliente.cpf?.includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie os beneficiários cadastrados</p>
        </div>
      </div>

      {/* Search */}
      <Card padding="sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes && filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.usuario?.nome || 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cliente.usuario?.email || 'Sem email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cliente.cpf || 'Sem CPF'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cliente.usuario?.telefone || 'Sem telefone'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={cliente.usuario?.ativo ? 'success' : 'danger'}>
                        {cliente.usuario?.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={18} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}