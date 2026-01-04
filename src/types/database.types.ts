export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string // UUID
          auth_user_id: string | null // UUID
          nome: string
          email: string
          tipo_usuario: 'admin' | 'tecnico' | 'usuario' | 'cliente'
          ativo: boolean
          created_at: string
          ultima_atualizacao: string
          telefone: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          nome: string
          email: string
          tipo_usuario?: 'admin' | 'tecnico' | 'usuario' | 'cliente'
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
          telefone?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          nome?: string
          email?: string
          tipo_usuario?: 'admin' | 'tecnico' | 'usuario' | 'cliente'
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
          telefone?: string | null
          avatar_url?: string | null
        }
      }
      clientes: {
        Row: {
          id: number
          usuario_id: string // UUID
          cpf: string
          tipo_pessoa: 'fisica' | 'juridica'
          cnpj: string | null
          razao_social: string | null
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          data_nascimento: string | null
          data_entrada: string
          empresa_id: number | null
          observacoes: string | null
          ativo: boolean
          created_at: string
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          usuario_id: string
          cpf: string
          tipo_pessoa?: 'fisica' | 'juridica'
          cnpj?: string | null
          razao_social?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          data_nascimento?: string | null
          data_entrada?: string
          empresa_id?: number | null
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          usuario_id?: string
          cpf?: string
          tipo_pessoa?: 'fisica' | 'juridica'
          cnpj?: string | null
          razao_social?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          data_nascimento?: string | null
          data_entrada?: string
          empresa_id?: number | null
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
        }
      }
      empresas: {
        Row: {
          id: number
          nome: string
          cnpj: string
          endereco: string | null
          cidade: string | null
          estado: string | null
          telefone: string | null
          email: string | null
          responsavel: string | null
          ativo: boolean
          created_at: string
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          nome: string
          cnpj: string
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          telefone?: string | null
          email?: string | null
          responsavel?: string | null
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          nome?: string
          cnpj?: string
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          telefone?: string | null
          email?: string | null
          responsavel?: string | null
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
        }
      }
      especialidades: {
        Row: {
          id: number
          nome: string
          descricao: string | null
          valor: number
          ativo: boolean
          created_at: string
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          nome: string
          descricao?: string | null
          valor: number
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          nome?: string
          descricao?: string | null
          valor?: number
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
        }
      }
      estabelecimentos: {
        Row: {
          id: number
          nome: string
          endereco: string
          cidade: string
          estado: string
          cep: string | null
          telefone: string | null
          latitude: number | null
          longitude: number | null
          especialidades: number[]
          ativo: boolean
          created_at: string
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          nome: string
          endereco: string
          cidade: string
          estado: string
          cep?: string | null
          telefone?: string | null
          latitude?: number | null
          longitude?: number | null
          especialidades?: number[]
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          nome?: string
          endereco?: string
          cidade?: string
          estado?: string
          cep?: string | null
          telefone?: string | null
          latitude?: number | null
          longitude?: number | null
          especialidades?: number[]
          ativo?: boolean
          created_at?: string
          ultima_atualizacao?: string
        }
      }
      agendamentos: {
        Row: {
          id: number
          cliente_id: number
          especialidade_id: number
          estabelecimento_id: number | null
          data_solicitacao: string
          data_agendamento: string | null
          status: 'pendente' | 'confirmado' | 'realizado' | 'cancelado'
          observacoes: string | null
          valor_coparticipacao: number
          pago: boolean
          data_pagamento: string | null
          created_at: string
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          cliente_id: number
          especialidade_id: number
          estabelecimento_id?: number | null
          data_solicitacao?: string
          data_agendamento?: string | null
          status?: 'pendente' | 'confirmado' | 'realizado' | 'cancelado'
          observacoes?: string | null
          valor_coparticipacao?: number
          pago?: boolean
          data_pagamento?: string | null
          created_at?: string
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          cliente_id?: number
          especialidade_id?: number
          estabelecimento_id?: number | null
          data_solicitacao?: string
          data_agendamento?: string | null
          status?: 'pendente' | 'confirmado' | 'realizado' | 'cancelado'
          observacoes?: string | null
          valor_coparticipacao?: number
          pago?: boolean
          data_pagamento?: string | null
          created_at?: string
          ultima_atualizacao?: string
        }
      }
      reembolsos: {
        Row: {
          id: number
          cliente_id: number
          tipo: 'consulta' | 'exame'
          valor_solicitado: number
          valor_aprovado: number | null
          status: 'pendente' | 'aprovado' | 'recusado' | 'pago'
          data_solicitacao: string
          data_aprovacao: string | null
          data_pagamento: string | null
          observacoes: string | null
          documentos: Json | null
          created_at: string
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          cliente_id: number
          tipo: 'consulta' | 'exame'
          valor_solicitado: number
          valor_aprovado?: number | null
          status?: 'pendente' | 'aprovado' | 'recusado' | 'pago'
          data_solicitacao?: string
          data_aprovacao?: string | null
          data_pagamento?: string | null
          observacoes?: string | null
          documentos?: Json | null
          created_at?: string
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          cliente_id?: number
          tipo?: 'consulta' | 'exame'
          valor_solicitado?: number
          valor_aprovado?: number | null
          status?: 'pendente' | 'aprovado' | 'recusado' | 'pago'
          data_solicitacao?: string
          data_aprovacao?: string | null
          data_pagamento?: string | null
          observacoes?: string | null
          documentos?: Json | null
          created_at?: string
          ultima_atualizacao?: string
        }
      }
      pagamentos: {
        Row: {
          id: number
          agendamento_id: number
          valor: number
          status: 'pendente' | 'pago' | 'cancelado'
          link_pagamento: string | null
          data_pagamento: string | null
          forma_pagamento: string | null
          created_at: string
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          agendamento_id: number
          valor: number
          status?: 'pendente' | 'pago' | 'cancelado'
          link_pagamento?: string | null
          data_pagamento?: string | null
          forma_pagamento?: string | null
          created_at?: string
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          agendamento_id?: number
          valor?: number
          status?: 'pendente' | 'pago' | 'cancelado'
          link_pagamento?: string | null
          data_pagamento?: string | null
          forma_pagamento?: string | null
          created_at?: string
          ultima_atualizacao?: string
        }
      }
      guias: {
        Row: {
          id: number
          agendamento_id: number
          tipo: 'atendimento' | 'exame'
          numero_guia: string
          arquivo_url: string | null
          data_emissao: string
          validade: string | null
          created_at: string
        }
        Insert: {
          id?: number
          agendamento_id: number
          tipo: 'atendimento' | 'exame'
          numero_guia: string
          arquivo_url?: string | null
          data_emissao?: string
          validade?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          agendamento_id?: number
          tipo?: 'atendimento' | 'exame'
          numero_guia?: string
          arquivo_url?: string | null
          data_emissao?: string
          validade?: string | null
          created_at?: string
        }
      }
      indicacoes: {
        Row: {
          id: number
          cliente_id: number
          nome_estabelecimento: string
          endereco: string
          cidade: string
          estado: string
          telefone: string | null
          especialidades_oferecidas: string
          status: 'pendente' | 'aprovado' | 'recusado'
          observacoes: string | null
          created_at: string
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          cliente_id: number
          nome_estabelecimento: string
          endereco: string
          cidade: string
          estado: string
          telefone?: string | null
          especialidades_oferecidas: string
          status?: 'pendente' | 'aprovado' | 'recusado'
          observacoes?: string | null
          created_at?: string
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          cliente_id?: number
          nome_estabelecimento?: string
          endereco?: string
          cidade?: string
          estado?: string
          telefone?: string | null
          especialidades_oferecidas?: string
          status?: 'pendente' | 'aprovado' | 'recusado'
          observacoes?: string | null
          created_at?: string
          ultima_atualizacao?: string
        }
      }
      notificacoes: {
        Row: {
          id: number
          usuario_id: string // UUID
          titulo: string
          mensagem: string
          tipo: 'info' | 'sucesso' | 'alerta' | 'erro'
          lida: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: number
          usuario_id: string
          titulo: string
          mensagem: string
          tipo?: 'info' | 'sucesso' | 'alerta' | 'erro'
          lida?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          usuario_id?: string
          titulo?: string
          mensagem?: string
          tipo?: 'info' | 'sucesso' | 'alerta' | 'erro'
          lida?: boolean
          link?: string | null
          created_at?: string
        }
      }
      financeiro: {
        Row: {
          id: number
          tipo: 'receita' | 'despesa'
          descricao: string
          valor: number
          categoria: string
          data_lancamento: string
          created_at: string
          usuario_id: string // UUID
        }
        Insert: {
          id?: number
          tipo: 'receita' | 'despesa'
          descricao: string
          valor: number
          categoria: string
          data_lancamento?: string
          created_at?: string
          usuario_id: string
        }
        Update: {
          id?: number
          tipo?: 'receita' | 'despesa'
          descricao?: string
          valor?: number
          categoria?: string
          data_lancamento?: string
          created_at?: string
          usuario_id?: string
        }
      }
      logs_sistema: {
        Row: {
          id: number
          usuario_id: string | null // UUID
          acao: string
          tabela: string | null
          registro_id: number | null
          detalhes: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: number
          usuario_id?: string | null
          acao: string
          tabela?: string | null
          registro_id?: number | null
          detalhes?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          usuario_id?: string | null
          acao?: string
          tabela?: string | null
          registro_id?: number | null
          detalhes?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}