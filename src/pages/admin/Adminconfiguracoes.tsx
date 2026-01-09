import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import { 
  Settings, 
  User,
  Lock,
  Bell,
  Database,
  Mail,
  Globe,
  Shield,
  Users,
  Building,
  Save,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/format'

export const AdminConfiguracoes = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('geral')
  const [showModalUsuario, setShowModalUsuario] = useState(false)
  const [showModalSenha, setShowModalSenha] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Form States
  const [formPerfil, setFormPerfil] = useState({
    nome: '',
    email: '',
    telefone: '',
  })

  const [formSenha, setFormSenha] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  })

  const [formNovoUsuario, setFormNovoUsuario] = useState({
    nome: '',
    email: '',
    tipo_usuario: 'admin',
    telefone: '',
    senha: '',
  })

  const [formConfigGeral, setFormConfigGeral] = useState({
    nome_sistema: 'Amém Saúde',
    email_contato: 'contato@amemsaude.com.br',
    telefone_contato: '(61) 9999-9999',
    valor_coparticipacao: '25.00',
    limite_mensal: '400.00',
  })

  // Buscar usuários do sistema
  const { data: usuarios } = useQuery({
    queryKey: ['usuarios-sistema'],
    queryFn: async () => {
      const { data, error } = await ApiService.supabase
        .from('usuarios')
        .select('*')
        .in('tipo_usuario', ['admin', 'operador'])
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  // Buscar dados do perfil atual
  const { data: perfilAtual } = useQuery({
    queryKey: ['perfil-atual'],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await ApiService.supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (error) throw error

      // Preencher form
      setFormPerfil({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
      })

      return data
    },
    enabled: !!user,
  })

  // Mutation atualizar perfil
  const atualizarPerfilMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!perfilAtual) return

      const { error } = await ApiService.supabase
        .from('usuarios')
        .update({
          nome: data.nome,
          telefone: data.telefone,
          ultima_atualizacao: new Date().toISOString(),
        })
        .eq('id', perfilAtual.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-atual'] })
      alert('Perfil atualizado com sucesso!')
    },
  })

  // Mutation alterar senha
  const alterarSenhaMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.novaSenha !== data.confirmarSenha) {
        throw new Error('As senhas não coincidem')
      }

      const { error } = await ApiService.supabase.auth.updateUser({
        password: data.novaSenha,
      })

      if (error) throw error
    },
    onSuccess: () => {
      setFormSenha({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
      setShowModalSenha(false)
      alert('Senha alterada com sucesso!')
    },
    onError: (error: any) => {
      alert(error.message || 'Erro ao alterar senha')
    },
  })

  // Mutation criar usuário
  const criarUsuarioMutation = useMutation({
    mutationFn: async (data: any) => {
      // 1. Criar usuário no auth
      const { data: authData, error: authError } = await ApiService.supabase.auth.signUp({
        email: data.email,
        password: data.senha,
      })

      if (authError) throw authError

      // 2. Criar registro na tabela usuarios
      const { error: dbError } = await ApiService.supabase
        .from('usuarios')
        .insert({
          auth_user_id: authData.user?.id,
          nome: data.nome,
          email: data.email,
          tipo_usuario: data.tipo_usuario,
          telefone: data.telefone,
          ativo: true,
        })

      if (dbError) throw dbError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-sistema'] })
      setShowModalUsuario(false)
      setFormNovoUsuario({
        nome: '',
        email: '',
        tipo_usuario: 'admin',
        telefone: '',
        senha: '',
      })
      alert('Usuário criado com sucesso!')
    },
    onError: (error: any) => {
      alert(error.message || 'Erro ao criar usuário')
    },
  })

  // Mutation desativar usuário
  const desativarUsuarioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await ApiService.supabase
        .from('usuarios')
        .update({ ativo: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-sistema'] })
      alert('Usuário desativado com sucesso!')
    },
  })

  // Mutation ativar usuário
  const ativarUsuarioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await ApiService.supabase
        .from('usuarios')
        .update({ ativo: true })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-sistema'] })
      alert('Usuário ativado com sucesso!')
    },
  })

  const handleSalvarPerfil = (e: React.FormEvent) => {
    e.preventDefault()
    atualizarPerfilMutation.mutate(formPerfil)
  }

  const handleAlterarSenha = (e: React.FormEvent) => {
    e.preventDefault()
    alterarSenhaMutation.mutate(formSenha)
  }

  const handleCriarUsuario = (e: React.FormEvent) => {
    e.preventDefault()
    criarUsuarioMutation.mutate(formNovoUsuario)
  }

  const tabs = [
    { id: 'geral', label: 'Geral', icon: <Settings size={18} /> },
    { id: 'perfil', label: 'Meu Perfil', icon: <User size={18} /> },
    { id: 'usuarios', label: 'Usuários', icon: <Users size={18} /> },
    { id: 'seguranca', label: 'Segurança', icon: <Shield size={18} /> },
    { id: 'backup', label: 'Backup', icon: <Database size={18} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Geral */}
      {activeTab === 'geral' && (
        <div className="space-y-6">
          <Card className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Configurações Gerais</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome do Sistema"
                  value={formConfigGeral.nome_sistema}
                  onChange={(e) => setFormConfigGeral({ ...formConfigGeral, nome_sistema: e.target.value })}
                />
                <Input
                  label="Email de Contato"
                  type="email"
                  value={formConfigGeral.email_contato}
                  onChange={(e) => setFormConfigGeral({ ...formConfigGeral, email_contato: e.target.value })}
                />
                <Input
                  label="Telefone de Contato"
                  value={formConfigGeral.telefone_contato}
                  onChange={(e) => setFormConfigGeral({ ...formConfigGeral, telefone_contato: e.target.value })}
                />
                <Input
                  label="Valor Coparticipação (R$)"
                  type="number"
                  step="0.01"
                  value={formConfigGeral.valor_coparticipacao}
                  onChange={(e) => setFormConfigGeral({ ...formConfigGeral, valor_coparticipacao: e.target.value })}
                />
                <Input
                  label="Limite Mensal (R$)"
                  type="number"
                  step="0.01"
                  value={formConfigGeral.limite_mensal}
                  onChange={(e) => setFormConfigGeral({ ...formConfigGeral, limite_mensal: e.target.value })}
                />
              </div>
              <Button type="button" className="flex items-center gap-2">
                <Save size={18} />
                Salvar Configurações
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Tab: Perfil */}
      {activeTab === 'perfil' && (
        <div className="space-y-6">
          <Card className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={40} className="text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{perfilAtual?.nome || 'Carregando...'}</h2>
                <p className="text-gray-600">{perfilAtual?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  {perfilAtual?.tipo_usuario === 'admin' ? 'Administrador' : 'Operador'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSalvarPerfil} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  value={formPerfil.nome}
                  onChange={(e) => setFormPerfil({ ...formPerfil, nome: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formPerfil.email}
                  disabled
                  className="bg-gray-50"
                />
                <Input
                  label="Telefone"
                  value={formPerfil.telefone}
                  onChange={(e) => setFormPerfil({ ...formPerfil, telefone: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" isLoading={atualizarPerfilMutation.isPending} className="flex items-center gap-2">
                  <Save size={18} />
                  Salvar Alterações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModalSenha(true)}
                  className="flex items-center gap-2"
                >
                  <Lock size={18} />
                  Alterar Senha
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Tab: Usuários */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Usuários do Sistema</h2>
              <p className="text-sm text-gray-600">Gerencie os usuários com acesso ao sistema</p>
            </div>
            <Button onClick={() => setShowModalUsuario(true)} className="flex items-center gap-2">
              <Plus size={18} />
              Novo Usuário
            </Button>
          </div>

          <Card className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usuarios && usuarios.length > 0 ? (
                    usuarios.map((usuario: any) => (
                      <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User size={18} className="text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{usuario.nome}</p>
                              <p className="text-xs text-gray-500">{usuario.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {usuario.tipo_usuario === 'admin' ? 'Administrador' : 'Operador'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            usuario.ativo 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {usuario.ativo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(usuario.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {usuario.ativo ? (
                              <button
                                onClick={() => {
                                  if (confirm('Deseja desativar este usuário?')) {
                                    desativarUsuarioMutation.mutate(usuario.id)
                                  }
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              >
                                <XCircle size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => ativarUsuarioMutation.mutate(usuario.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Nenhum usuário encontrado</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Segurança */}
      {activeTab === 'seguranca' && (
        <div className="space-y-6">
          <Card className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Configurações de Segurança</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-gray-600">Adicione uma camada extra de segurança</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Ativar
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Sessões Ativas</p>
                  <p className="text-sm text-gray-600">Visualize e gerencie dispositivos conectados</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Ver Sessões
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Log de Atividades</p>
                  <p className="text-sm text-gray-600">Histórico de ações no sistema</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Ver Logs
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Backup */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <Card className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Backup e Restauração</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Informação:</strong> Os backups são realizados automaticamente todos os dias às 03:00 AM.
                  Você pode fazer backup manual a qualquer momento.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Download size={24} className="text-primary-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Fazer Backup Manual</p>
                    <p className="text-xs text-gray-600">Exportar dados do sistema</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Upload size={24} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Restaurar Backup</p>
                    <p className="text-xs text-gray-600">Importar dados salvos</p>
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Últimos Backups</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database size={18} className="text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">backup-{new Date().toISOString().split('T')[0]}.sql</p>
                          <p className="text-xs text-gray-600">Tamanho: 2.5 MB</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-600">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Alterar Senha */}
      <Modal
        isOpen={showModalSenha}
        onClose={() => setShowModalSenha(false)}
        title="Alterar Senha"
        size="md"
      >
        <form onSubmit={handleAlterarSenha} className="space-y-4">
          <div className="relative">
            <Input
              label="Nova Senha"
              type={showPassword ? 'text' : 'password'}
              value={formSenha.novaSenha}
              onChange={(e) => setFormSenha({ ...formSenha, novaSenha: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Input
            label="Confirmar Nova Senha"
            type="password"
            value={formSenha.confirmarSenha}
            onChange={(e) => setFormSenha({ ...formSenha, confirmarSenha: e.target.value })}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModalSenha(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={alterarSenhaMutation.isPending} fullWidth>
              Alterar Senha
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Novo Usuário */}
      <Modal
        isOpen={showModalUsuario}
        onClose={() => setShowModalUsuario(false)}
        title="Novo Usuário"
        size="lg"
      >
        <form onSubmit={handleCriarUsuario} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo *"
              value={formNovoUsuario.nome}
              onChange={(e) => setFormNovoUsuario({ ...formNovoUsuario, nome: e.target.value })}
              required
            />
            <Input
              label="Email *"
              type="email"
              value={formNovoUsuario.email}
              onChange={(e) => setFormNovoUsuario({ ...formNovoUsuario, email: e.target.value })}
              required
            />
            <Input
              label="Telefone"
              value={formNovoUsuario.telefone}
              onChange={(e) => setFormNovoUsuario({ ...formNovoUsuario, telefone: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuário *
              </label>
              <select
                value={formNovoUsuario.tipo_usuario}
                onChange={(e) => setFormNovoUsuario({ ...formNovoUsuario, tipo_usuario: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="admin">Administrador</option>
                <option value="operador">Operador</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Input
                label="Senha *"
                type="password"
                value={formNovoUsuario.senha}
                onChange={(e) => setFormNovoUsuario({ ...formNovoUsuario, senha: e.target.value })}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModalUsuario(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={criarUsuarioMutation.isPending} fullWidth>
              Criar Usuário
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}