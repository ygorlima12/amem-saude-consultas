import type { Database } from './database.types'

// Tipos derivados do banco de dados
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type Empresa = Database['public']['Tables']['empresas']['Row']
export type Especialidade = Database['public']['Tables']['especialidades']['Row']
export type Estabelecimento = Database['public']['Tables']['estabelecimentos']['Row']
export type Agendamento = Database['public']['Tables']['agendamentos']['Row']
export type Reembolso = Database['public']['Tables']['reembolsos']['Row']
export type Pagamento = Database['public']['Tables']['pagamentos']['Row']
export type Guia = Database['public']['Tables']['guias']['Row']
export type Indicacao = Database['public']['Tables']['indicacoes']['Row']
export type Notificacao = Database['public']['Tables']['notificacoes']['Row']
export type Financeiro = Database['public']['Tables']['financeiro']['Row']
export type LogSistema = Database['public']['Tables']['logs_sistema']['Row']

// Tipos para inserção
export type NovoUsuario = Database['public']['Tables']['usuarios']['Insert']
export type NovoCliente = Database['public']['Tables']['clientes']['Insert']
export type NovaEmpresa = Database['public']['Tables']['empresas']['Insert']
export type NovaEspecialidade = Database['public']['Tables']['especialidades']['Insert']
export type NovoEstabelecimento = Database['public']['Tables']['estabelecimentos']['Insert']
export type NovoAgendamento = Database['public']['Tables']['agendamentos']['Insert']
export type NovoReembolso = Database['public']['Tables']['reembolsos']['Insert']
export type NovoPagamento = Database['public']['Tables']['pagamentos']['Insert']
export type NovaGuia = Database['public']['Tables']['guias']['Insert']
export type NovaIndicacao = Database['public']['Tables']['indicacoes']['Insert']
export type NovaNotificacao = Database['public']['Tables']['notificacoes']['Insert']
export type NovoFinanceiro = Database['public']['Tables']['financeiro']['Insert']

// Tipos para atualização
export type AtualizarUsuario = Database['public']['Tables']['usuarios']['Update']
export type AtualizarCliente = Database['public']['Tables']['clientes']['Update']

// Tipos customizados para a aplicação
export interface AgendamentoCompleto extends Agendamento {
  cliente?: Cliente
  especialidade?: Especialidade
  estabelecimento?: Estabelecimento
  pagamento?: Pagamento
}

export interface ClienteCompleto extends Cliente {
  usuario?: Usuario
  empresa?: Empresa
}

export interface EstabelecimentoComEspecialidades extends Estabelecimento {
  especialidades_detalhes?: Especialidade[]
}

// Tipos de formulários
export interface LoginForm {
  email: string
  password: string
}

export interface CadastroClienteForm {
  nome: string
  email: string
  cpf: string
  telefone: string
  senha: string
  confirmarSenha: string
  dataNascimento?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
}

export interface AgendamentoForm {
  especialidadeId: number
  estabelecimentoId: number
  observacoes?: string
}

export interface ReembolsoForm {
  tipo: 'consulta' | 'exame'
  valorSolicitado: number
  observacoes?: string
}

// Tipos de resposta de API
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Contextos e Estados
export interface AuthState {
  user: Usuario | null
  cliente: Cliente | null
  loading: boolean
  isAuthenticated: boolean
}

export interface NotificationState {
  notifications: Notificacao[]
  unreadCount: number
}

// Enums
export enum TipoUsuario {
  ADMIN = 'admin',
  TECNICO = 'tecnico',
  USUARIO = 'usuario',
  CLIENTE = 'cliente',
}

export enum StatusAgendamento {
  PENDENTE = 'pendente',
  CONFIRMADO = 'confirmado',
  REALIZADO = 'realizado',
  CANCELADO = 'cancelado',
}

export enum StatusReembolso {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  RECUSADO = 'recusado',
  PAGO = 'pago',
}

export enum StatusPagamento {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  CANCELADO = 'cancelado',
}

export enum StatusIndicacao {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  RECUSADO = 'recusado',
}
