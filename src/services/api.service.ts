import { supabase } from '@/config/supabase'
import type {
  Agendamento,
  NovoAgendamento,
  Reembolso,
  NovoReembolso,
  Especialidade,
  Estabelecimento,
  Notificacao,
  Cliente,
  AtualizarCliente,
  Indicacao,
  NovaIndicacao,
} from '@/types'

export class ApiService {
  // ==================== AGENDAMENTOS ====================

  static async getAgendamentos(clienteId: number) {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        especialidade:especialidades(*),
        estabelecimento:estabelecimentos(*),
        pagamento:pagamentos(*)
      `)
      .eq('cliente_id', clienteId)
      .order('data_solicitacao', { ascending: false })

    if (error) throw error
    return data
  }

  static async createAgendamento(agendamento: NovoAgendamento) {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert(agendamento)
      .select()
      .single()

    if (error) throw error
    return data as Agendamento
  }

  static async cancelarAgendamento(agendamentoId: number) {
    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status: 'cancelado' })
      .eq('id', agendamentoId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==================== REEMBOLSOS ====================

  static async getReembolsos(clienteId: number) {
    const { data, error } = await supabase
      .from('reembolsos')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('data_solicitacao', { ascending: false })

    if (error) throw error
    return data as Reembolso[]
  }

  static async createReembolso(reembolso: NovoReembolso) {
    const { data, error } = await supabase
      .from('reembolsos')
      .insert(reembolso)
      .select()
      .single()

    if (error) throw error
    return data as Reembolso
  }

  // ==================== ESPECIALIDADES ====================

  static async getEspecialidades() {
    const { data, error } = await supabase
      .from('especialidades')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) throw error
    return data as Especialidade[]
  }

  static async getEspecialidadeById(id: number) {
    const { data, error } = await supabase
      .from('especialidades')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Especialidade
  }

  // ==================== ESTABELECIMENTOS ====================

  static async getEstabelecimentos(filters?: {
    cidade?: string
    estado?: string
    especialidadeId?: number
  }) {
    let query = supabase
      .from('estabelecimentos')
      .select('*')
      .eq('ativo', true)

    if (filters?.cidade) {
      query = query.eq('cidade', filters.cidade)
    }

    if (filters?.estado) {
      query = query.eq('estado', filters.estado)
    }

    if (filters?.especialidadeId) {
      query = query.contains('especialidades', [filters.especialidadeId])
    }

    const { data, error } = await query.order('nome')

    if (error) throw error
    return data as Estabelecimento[]
  }

  static async getEstabelecimentoById(id: number) {
    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Estabelecimento
  }

  // ==================== NOTIFICAÇÕES ====================

  static async getNotificacoes(usuarioId: number) {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Notificacao[]
  }

  static async marcarComoLida(notificacaoId: number) {
    const { data, error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', notificacaoId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async marcarTodasComoLidas(usuarioId: number) {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('usuario_id', usuarioId)
      .eq('lida', false)

    if (error) throw error
  }

  // ==================== CLIENTE ====================

  static async updateCliente(clienteId: number, dados: AtualizarCliente) {
    const { data, error } = await supabase
      .from('clientes')
      .update(dados)
      .eq('id', clienteId)
      .select()
      .single()

    if (error) throw error
    return data as Cliente
  }

  static async getClienteById(id: number) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*, usuario:usuarios(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // ==================== INDICAÇÕES ====================

  static async getIndicacoes(clienteId: number) {
    const { data, error } = await supabase
      .from('indicacoes')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Indicacao[]
  }

  static async createIndicacao(indicacao: NovaIndicacao) {
    const { data, error } = await supabase
      .from('indicacoes')
      .insert(indicacao)
      .select()
      .single()

    if (error) throw error
    return data as Indicacao
  }

  // ==================== PAGAMENTOS ====================

  static async createPagamento(agendamentoId: number, valor: number) {
    const { data, error } = await supabase
      .from('pagamentos')
      .insert({
        agendamento_id: agendamentoId,
        valor,
        link_pagamento: `https://pay.example.com/${Date.now()}`, // Integrar com gateway real
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==================== GUIAS ====================

  static async getGuias(agendamentoId: number) {
    const { data, error } = await supabase
      .from('guias')
      .select('*')
      .eq('agendamento_id', agendamentoId)

    if (error) throw error
    return data
  }

  // ==================== VIACEPCEP API ====================

  static async buscarCEP(cep: string) {
    try {
      const cepLimpo = cep.replace(/\D/g, '')
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        throw new Error('CEP não encontrado')
      }

      return {
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        cep: data.cep,
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      throw error
    }
  }
}
