// Modo de desenvolvimento - permite testar a interface sem Supabase
export const isDevelopmentMode = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  return url === 'https://example.supabase.co' || key === 'example-key'
}

// Dados mock para desenvolvimento
export const mockUsuario = {
  id: 1,
  nome: 'João da Silva (Demo)',
  email: 'demo@cliente.com',
  senha_hash: '',
  tipo_usuario: 'cliente' as const,
  telefone: '(11) 99999-9999',
  avatar_url: null,
  ativo: true,
  created_at: new Date().toISOString(),
  ultima_atualizacao: new Date().toISOString(),
}

export const mockCliente = {
  id: 1,
  usuario_id: 1,
  cpf: '123.456.789-00',
  tipo_pessoa: 'fisica' as const,
  cnpj: null,
  razao_social: null,
  endereco: 'Rua das Flores, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01234-567',
  data_nascimento: '1990-01-01',
  data_entrada: new Date().toISOString(),
  empresa_id: null,
  observacoes: null,
  ativo: true,
  created_at: new Date().toISOString(),
  ultima_atualizacao: new Date().toISOString(),
}

export const mockAdmin = {
  id: 999,
  nome: 'Admin (Demo)',
  email: 'demo@admin.com',
  senha_hash: '',
  tipo_usuario: 'admin' as const,
  telefone: '(11) 88888-8888',
  avatar_url: null,
  ativo: true,
  created_at: new Date().toISOString(),
  ultima_atualizacao: new Date().toISOString(),
}
