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

  // ==================== UPDATE AGENDAMENTO ====================

static async updateAgendamento(
  agendamentoId: number, 
  dados: {
    qrcode_pagamento?: string | null
    pix_copia_cola?: string | null
    data_agendamento?: string | null
    status?: string
    pago?: boolean
    data_pagamento?: string | null
    observacoes?: string | null
  }
) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update(dados)
    .eq('id', agendamentoId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar agendamento:', error)
    throw error
  }

  return data
}


  static async createAgendamento(agendamento: NovoAgendamento) {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert(agendamento)
      .select()
      .single()

    if (error) throw error

    // Criar notificação para admin (buscar primeiro admin do sistema)
    const { data: adminUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('tipo_usuario', 'admin')
      .limit(1)
      .single()

    if (adminUser) {
      await this.createNotificacao({
        usuario_id: adminUser.id,
        titulo: 'Nova Solicitação de Agendamento',
        mensagem: `Um novo agendamento foi solicitado e aguarda confirmação.`,
        tipo: 'alerta',
        link: `/admin/agendamentos/pendentes`,
      })
    }

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

  // ==================== AGENDAMENTOS PENDENTES (ADMIN) ====================

  static async getAgendamentosPendentes() {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:clientes(
          id,
          cpf,
          usuario:usuarios(id, nome, email, telefone)
        ),
        especialidade:especialidades(id, nome, valor),
        estabelecimento:estabelecimentos(id, nome, endereco, cidade, estado)
      `)
      .eq('status', 'pendente')
      .order('data_solicitacao', { ascending: false })

    if (error) throw error
    return data
  }

  static async getAllAgendamentos(filters?: {
    status?: string
    data_inicio?: string
    data_fim?: string
  }) {
    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:clientes(
          id,
          cpf,
          usuario:usuarios(id, nome, email)
        ),
        especialidade:especialidades(id, nome),
        estabelecimento:estabelecimentos(id, nome, cidade, estado)
      `)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.data_inicio) {
      query = query.gte('data_agendamento', filters.data_inicio)
    }

    if (filters?.data_fim) {
      query = query.lte('data_agendamento', filters.data_fim)
    }

    const { data, error } = await query.order('data_solicitacao', { ascending: false })

    if (error) throw error
    return data
  }

  static async confirmarAgendamento(
    agendamentoId: number,
    dados: {
      data_agendamento: string
      estabelecimento_id?: number
      observacoes?: string
    }
  ) {
    // 1. Atualizar agendamento
    const { data: agendamento, error: updateError } = await supabase
      .from('agendamentos')
      .update({
        status: 'confirmado',
        data_agendamento: dados.data_agendamento,
        estabelecimento_id: dados.estabelecimento_id,
        observacoes: dados.observacoes,
      })
      .eq('id', agendamentoId)
      .select(`
        *,
        cliente:clientes(
          id,
          usuario:usuarios(id, nome, email)
        ),
        especialidade:especialidades(id, nome)
      `)
      .single()

    if (updateError) throw updateError

    // 2. Criar notificação para o cliente
    if (agendamento.cliente?.usuario?.id) {
      const dataFormatada = new Date(dados.data_agendamento).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      await this.createNotificacao({
        usuario_id: agendamento.cliente.usuario.id,
        titulo: 'Agendamento Confirmado',
        mensagem: `Seu agendamento de ${agendamento.especialidade?.nome} foi confirmado para ${dataFormatada}.`,
        tipo: 'sucesso',
        link: `/cliente/agendamentos`,
      })
    }

    // 3. Gerar guia automaticamente
    const numeroGuia = `GU-${new Date().getFullYear()}-${String(agendamentoId).padStart(6, '0')}`
    const validade = new Date()
    validade.setDate(validade.getDate() + 30) // Validade de 30 dias

    await supabase.from('guias').insert({
      agendamento_id: agendamentoId,
      tipo: 'atendimento',
      numero_guia: numeroGuia,
      validade: validade.toISOString().split('T')[0],
    })

    return agendamento
  }

  static async recusarAgendamento(agendamentoId: number, motivo: string) {
    // 1. Atualizar agendamento
    const { data: agendamento, error: updateError } = await supabase
      .from('agendamentos')
      .update({
        status: 'cancelado',
        observacoes: `RECUSADO: ${motivo}`,
      })
      .eq('id', agendamentoId)
      .select(`
        *,
        cliente:clientes(
          id,
          usuario:usuarios(id, nome)
        )
      `)
      .single()

    if (updateError) throw updateError

    // 2. Notificar o cliente
    if (agendamento.cliente?.usuario?.id) {
      await this.createNotificacao({
        usuario_id: agendamento.cliente.usuario.id,
        titulo: 'Agendamento Recusado',
        mensagem: `Seu agendamento foi recusado. Motivo: ${motivo}`,
        tipo: 'erro',
        link: `/cliente/agendamentos`,
      })
    }

    return agendamento
  }

  // ==================== NOTIFICAÇÕES ====================

  static async getNotificacoes(usuarioId: string) {
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

  static async marcarTodasComoLidas(usuarioId: string) {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('usuario_id', usuarioId)
      .eq('lida', false)

    if (error) throw error
  }

  static async createNotificacao(notificacao: {
    usuario_id: string // UUID
    titulo: string
    mensagem: string
    tipo: 'info' | 'sucesso' | 'alerta' | 'erro'
    link?: string
  }) {
    const { data, error } = await supabase
      .from('notificacoes')
      .insert(notificacao)
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

  static async getAllClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        usuario:usuarios(id, nome, email, telefone, ativo)
      `)
      .order('created_at', { ascending: false })

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

  static async getGuiasCliente(clienteId: number) {
    const { data, error } = await supabase
      .from('guias')
      .select(`
        *,
        agendamento:agendamentos(
          id,
          data_agendamento,
          especialidade:especialidades(id, nome),
          estabelecimento:estabelecimentos(id, nome, endereco)
        )
      `)
      .eq('agendamento.cliente_id', clienteId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // ==================== DASHBOARD (ADMIN) ====================

  static async getDashboardStats() {
    // Total de clientes
    const { count: totalClientes } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)

    // Total de agendamentos
    const { count: totalAgendamentos } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })

    // Agendamentos pendentes
    const { count: agendamentosPendentes } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    // Reembolsos pendentes
    const { count: reembolsosPendentes } = await supabase
      .from('reembolsos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    // Receita do mês atual
    const primeiroDiaMes = new Date()
    primeiroDiaMes.setDate(1)
    primeiroDiaMes.setHours(0, 0, 0, 0)

    const { data: pagamentosMes } = await supabase
      .from('pagamentos')
      .select('valor')
      .eq('status', 'pago')
      .gte('data_pagamento', primeiroDiaMes.toISOString())

    const receitaMes = pagamentosMes?.reduce((acc, p) => acc + Number(p.valor), 0) || 0

    return {
      totalClientes: totalClientes || 0,
      totalAgendamentos: totalAgendamentos || 0,
      agendamentosPendentes: agendamentosPendentes || 0,
      reembolsosPendentes: reembolsosPendentes || 0,
      receitaMes,
    }
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