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

  // ============================================
// ADICIONAR NO api.service.ts
// Adicione estes métodos na classe ApiService
// ============================================

  // Exportar supabase para uso direto
  static supabase = supabase

  // ==================== DASHBOARD - ESTATÍSTICAS GERAIS ====================

  static async getDashboardStats() {
    try {
      // Buscar todos os dados necessários em paralelo
      const [agendamentosRes, clientesRes] = await Promise.all([
        supabase.from('agendamentos').select('*'),
        supabase.from('clientes').select('*')
      ])

      if (agendamentosRes.error) throw agendamentosRes.error
      if (clientesRes.error) throw clientesRes.error

      const agendamentos = agendamentosRes.data || []
      const clientes = clientesRes.data || []

      const hoje = new Date().toISOString().split('T')[0]
      const mesAtual = new Date().getMonth()
      const anoAtual = new Date().getFullYear()

      return {
        totalAgendamentos: agendamentos.length,
        agendamentosHoje: agendamentos.filter(a => 
          a.data_agendamento?.startsWith(hoje)
        ).length,
        agendamentosPendentes: agendamentos.filter(a => 
          a.status === 'pendente'
        ).length,
        totalClientes: clientes.length,
        receitaMes: agendamentos
          .filter(a => {
            const data = new Date(a.data_solicitacao)
            return data.getMonth() === mesAtual && 
                   data.getFullYear() === anoAtual &&
                   a.pago
          })
          .reduce((sum, a) => sum + (a.valor_coparticipacao || 0), 0),
        receitaTotal: agendamentos
          .filter(a => a.pago)
          .reduce((sum, a) => sum + (a.valor_coparticipacao || 0), 0)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  // ==================== DASHBOARD - ÚLTIMOS AGENDAMENTOS ====================

  static async getUltimosAgendamentos(limite: number = 5) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(
            id,
            cpf,
            telefone,
            usuario:usuarios(id, nome, email)
          ),
          especialidade:especialidades(id, nome, valor),
          estabelecimento:estabelecimentos(id, nome, cidade, estado)
        `)
        .order('data_solicitacao', { ascending: false })
        .limit(limite)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao buscar últimos agendamentos:', error)
      throw error
    }
  }

  // ==================== DASHBOARD - ESTATÍSTICAS FINANCEIRAS ====================

  static async getDashboardFinanceiro() {
    try {
      const [agendamentosRes, reembolsosRes] = await Promise.all([
        supabase.from('agendamentos').select('*'),
        supabase.from('reembolsos').select('*')
      ])

      if (agendamentosRes.error) throw agendamentosRes.error
      if (reembolsosRes.error) throw reembolsosRes.error

      const agendamentos = agendamentosRes.data || []
      const reembolsos = reembolsosRes.data || []

      const mesAtual = new Date().getMonth()
      const anoAtual = new Date().getFullYear()

      // Receitas
      const agendamentosPagos = agendamentos.filter(a => a.pago)
      const receitaMes = agendamentos
        .filter(a => {
          if (!a.pago) return false
          const data = new Date(a.data_pagamento || a.data_solicitacao)
          return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
        })
        .reduce((sum, a) => sum + (a.valor_coparticipacao || 0), 0)

      const receitaTotal = agendamentosPagos
        .reduce((sum, a) => sum + (a.valor_coparticipacao || 0), 0)

      // Despesas (Reembolsos aprovados)
      const reembolsosAprovados = reembolsos.filter(r => r.status === 'aprovado')
      const despesaMes = reembolsos
        .filter(r => {
          if (r.status !== 'aprovado') return false
          const data = new Date(r.data_solicitacao)
          return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
        })
        .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0)

      const despesaTotal = reembolsosAprovados
        .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0)

      return {
        receitaMes,
        despesaMes,
        lucroMes: receitaMes - despesaMes,
        receitaTotal,
        despesaTotal,
        lucroTotal: receitaTotal - despesaTotal,
        pagamentosPendentes: agendamentos.filter(a => !a.pago).length,
        reembolsosPendentes: reembolsos.filter(r => r.status === 'pendente').length,
        valorPendenteReceber: agendamentos
          .filter(a => !a.pago)
          .reduce((sum, a) => sum + (a.valor_coparticipacao || 0), 0),
        valorPendentePagar: reembolsos
          .filter(r => r.status === 'pendente')
          .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0)
      }
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error)
      throw error
    }
  }

  // ==================== DASHBOARD - ESTATÍSTICAS DE AGENDAMENTOS ====================

  static async getDashboardAgendamentos() {
    try {
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select('*')

      if (error) throw error

      const hoje = new Date()
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

      const total = agendamentos?.length || 0
      const pendentes = agendamentos?.filter(a => a.status === 'pendente').length || 0
      const confirmados = agendamentos?.filter(a => a.status === 'confirmado').length || 0
      const realizados = agendamentos?.filter(a => a.status === 'realizado').length || 0
      const cancelados = agendamentos?.filter(a => a.status === 'cancelado').length || 0

      const esteMes = agendamentos?.filter(a => {
        const data = new Date(a.data_solicitacao)
        return data >= primeiroDiaMes && data <= ultimoDiaMes
      }).length || 0

      const taxaCancelamento = total > 0 
        ? ((cancelados / total) * 100).toFixed(1)
        : '0.0'

      const taxaConversao = total > 0
        ? ((realizados / total) * 100).toFixed(1)
        : '0.0'

      return {
        total,
        pendentes,
        confirmados,
        realizados,
        cancelados,
        esteMes,
        taxaCancelamento: parseFloat(taxaCancelamento),
        taxaConversao: parseFloat(taxaConversao)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de agendamentos:', error)
      throw error
    }
  }

  

  // ==================== DASHBOARD - ESTATÍSTICAS DE REEMBOLSOS ====================

  static async getDashboardReembolsos() {
    try {
      const { data: reembolsos, error } = await supabase
        .from('reembolsos')
        .select('*')

      if (error) throw error

      const hoje = new Date()
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

      const total = reembolsos?.length || 0
      const pendentes = reembolsos?.filter(r => r.status === 'pendente').length || 0
      const aprovados = reembolsos?.filter(r => r.status === 'aprovado').length || 0
      const recusados = reembolsos?.filter(r => r.status === 'recusado').length || 0

      const esteMes = reembolsos?.filter(r => {
        const data = new Date(r.data_solicitacao)
        return data >= primeiroDiaMes
      }).length || 0

      const valorTotal = reembolsos
        ?.filter(r => r.status === 'aprovado')
        .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0) || 0

      const valorPendente = reembolsos
        ?.filter(r => r.status === 'pendente')
        .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0) || 0

      const valorRecusado = reembolsos
        ?.filter(r => r.status === 'recusado')
        .reduce((sum, r) => sum + (r.valor_solicitado || 0), 0) || 0

      const taxaAprovacao = total > 0
        ? ((aprovados / total) * 100).toFixed(1)
        : '0.0'

      return {
        total,
        pendentes,
        aprovados,
        recusados,
        esteMes,
        valorTotal,
        valorPendente,
        valorRecusado,
        taxaAprovacao: parseFloat(taxaAprovacao)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de reembolsos:', error)
      throw error
    }
  }

  // ==================== DASHBOARD - AGENDAMENTOS POR ESPECIALIDADE ====================

  static async getAgendamentosPorEspecialidade(limite: number = 10) {
    try {
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          especialidade:especialidades(id, nome)
        `)

      if (error) throw error

      // Contar agendamentos por especialidade
      const contagem: Record<string, { nome: string; total: number }> = {}

      agendamentos?.forEach((a: any) => {
        const especialidadeNome = a.especialidade?.nome || 'Sem especialidade'
        if (!contagem[especialidadeNome]) {
          contagem[especialidadeNome] = { nome: especialidadeNome, total: 0 }
        }
        contagem[especialidadeNome].total++
      })

      // Converter para array e ordenar
      const resultado = Object.values(contagem)
        .sort((a, b) => b.total - a.total)
        .slice(0, limite)

      return resultado
    } catch (error) {
      console.error('Erro ao buscar agendamentos por especialidade:', error)
      throw error
    }
  }

  // ==================== DASHBOARD - AGENDAMENTOS POR MÊS ====================

  static async getAgendamentosPorMes(ano?: number) {
    try {
      const anoFiltro = ano || new Date().getFullYear()

      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select('data_solicitacao, status')
        .gte('data_solicitacao', `${anoFiltro}-01-01`)
        .lte('data_solicitacao', `${anoFiltro}-12-31`)

      if (error) throw error

      // Inicializar array com 12 meses
      const meses = Array.from({ length: 12 }, (_, i) => ({
        mes: i + 1,
        nome: new Date(anoFiltro, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
        total: 0,
        realizados: 0,
        cancelados: 0
      }))

      // Contar agendamentos por mês
      agendamentos?.forEach(a => {
        const mes = new Date(a.data_solicitacao).getMonth()
        meses[mes].total++
        if (a.status === 'realizado') meses[mes].realizados++
        if (a.status === 'cancelado') meses[mes].cancelados++
      })

      return meses
    } catch (error) {
      console.error('Erro ao buscar agendamentos por mês:', error)
      throw error
    }
  }

  // ==================== DASHBOARD - RECEITA POR MÊS ====================

  static async getReceitaPorMes(ano?: number) {
    try {
      const anoFiltro = ano || new Date().getFullYear()

      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select('data_pagamento, data_solicitacao, valor_coparticipacao, pago')
        .eq('pago', true)
        .gte('data_pagamento', `${anoFiltro}-01-01`)
        .lte('data_pagamento', `${anoFiltro}-12-31`)

      if (error) throw error

      // Inicializar array com 12 meses
      const meses = Array.from({ length: 12 }, (_, i) => ({
        mes: i + 1,
        nome: new Date(anoFiltro, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
        receita: 0
      }))

      // Somar receita por mês
      agendamentos?.forEach(a => {
        const data = a.data_pagamento || a.data_solicitacao
        const mes = new Date(data).getMonth()
        meses[mes].receita += a.valor_coparticipacao || 0
      })

      return meses
    } catch (error) {
      console.error('Erro ao buscar receita por mês:', error)
      throw error
    }
  }

  // ==================== INFORMAR PAGAMENTO ====================

  static async informarPagamento(agendamentoId: number) {
    try {
      // 1. Marcar que cliente informou pagamento
      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({
          cliente_informou_pagamento: true,
          data_informacao_pagamento: new Date().toISOString()
        })
        .eq('id', agendamentoId)

      if (updateError) {
        console.error('Erro ao atualizar agendamento:', updateError)
        throw updateError
      }

      // 2. Buscar admin para notificar
      const { data: adminUser, error: adminError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('tipo_usuario', 'admin')
        .limit(1)
        .single()

      if (adminError) {
        console.error('Erro ao buscar admin:', adminError)
      }

      // 3. Criar notificação para admin
      if (adminUser) {
        await this.createNotificacao({
          usuario_id: adminUser.id,
          titulo: 'Cliente Informou Pagamento',
          mensagem: `O cliente informou que realizou o pagamento do agendamento #${agendamentoId}. Verifique e confirme.`,
          tipo: 'alerta',
          link: `/admin/agendamentos/pendentes`,
        })
      }

      // 4. Retornar sucesso
      return { success: true, message: 'Pagamento informado com sucesso!' }
    } catch (error) {
      console.error('Erro ao informar pagamento:', error)
      throw error
    }
  }

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

  static async getAgendamentosConfirmados() {
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
      .eq('status', 'confirmado')
      .order('data_solicitacao', { ascending: false })

    if (error) throw error
    return data
  }

  static async getAgendamentosCancelados() {
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
      .eq('status', 'cancelado')
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

  // ==================== RELATÓRIOS - ESTATÍSTICAS GERAIS ====================

  static async getRelatoriosStats() {
    try {
      const [clientesRes, agendamentosRes, reembolsosRes] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact' }),
        supabase.from('agendamentos').select('*'),
        supabase.from('reembolsos').select('*').eq('status', 'aprovado')
      ])

      if (clientesRes.error) throw clientesRes.error
      if (agendamentosRes.error) throw agendamentosRes.error
      if (reembolsosRes.error) throw reembolsosRes.error

      const totalClientes = clientesRes.count || 0
      const agendamentos = agendamentosRes.data || []
      const reembolsos = reembolsosRes.data || []

      const totalAgendamentos = agendamentos.length
      const totalReembolsado = reembolsos.reduce((sum, r) => sum + (r.valor_solicitado || 0), 0)
      
      const agendamentosPagos = agendamentos.filter(a => a.pago)
      const totalCoparticipacao = agendamentosPagos.reduce((sum, a) => sum + (a.valor_coparticipacao || 0), 0)

      return {
        totalClientes,
        totalAgendamentos,
        totalReembolsado,
        totalCoparticipacao
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de relatórios:', error)
      throw error
    }
  }

  // ==================== RELATÓRIOS - DADOS PARA EXPORTAÇÃO ====================

  static async getDadosRelatorioClientes(filtros?: {
    dataInicio?: string
    dataFim?: string
  }) {
    try {
      let query = supabase
        .from('clientes')
        .select(`
          *,
          usuario:usuarios(id, nome, email, telefone, data_cadastro)
        `)
        .order('id', { ascending: true })

      if (filtros?.dataInicio) {
        query = query.gte('data_cadastro', filtros.dataInicio)
      }

      if (filtros?.dataFim) {
        query = query.lte('data_cadastro', filtros.dataFim)
      }

      const { data, error } = await query

      if (error) throw error

      // Formatar dados para exportação
      return data?.map(cliente => ({
        ID: cliente.id,
        Nome: cliente.usuario?.nome || 'N/A',
        CPF: cliente.cpf,
        Email: cliente.usuario?.email || 'N/A',
        Telefone: cliente.usuario?.telefone || 'N/A',
        Cidade: cliente.cidade || 'N/A',
        Estado: cliente.estado || 'N/A',
        'Data Cadastro': new Date(cliente.data_cadastro || cliente.usuario?.data_cadastro).toLocaleDateString('pt-BR'),
        Status: cliente.ativo ? 'Ativo' : 'Inativo'
      })) || []
    } catch (error) {
      console.error('Erro ao buscar dados de clientes:', error)
      throw error
    }
  }

  static async getDadosRelatorioAgendamentos(filtros?: {
    dataInicio?: string
    dataFim?: string
  }) {
    try {
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(
            id,
            cpf,
            usuario:usuarios(id, nome, email)
          ),
          especialidade:especialidades(id, nome, valor),
          estabelecimento:estabelecimentos(id, nome, cidade, estado)
        `)
        .order('data_solicitacao', { ascending: false })

      if (filtros?.dataInicio) {
        query = query.gte('data_solicitacao', filtros.dataInicio)
      }

      if (filtros?.dataFim) {
        query = query.lte('data_solicitacao', filtros.dataFim)
      }

      const { data, error } = await query

      if (error) throw error

      // Formatar dados para exportação
      return data?.map(agendamento => ({
        ID: agendamento.id,
        Cliente: agendamento.cliente?.usuario?.nome || 'N/A',
        CPF: agendamento.cliente?.cpf || 'N/A',
        Especialidade: agendamento.especialidade?.nome || 'N/A',
        Estabelecimento: agendamento.estabelecimento?.nome || 'N/A',
        Cidade: agendamento.estabelecimento?.cidade || 'N/A',
        Estado: agendamento.estabelecimento?.estado || 'N/A',
        'Data Solicitação': new Date(agendamento.data_solicitacao).toLocaleDateString('pt-BR'),
        'Data Agendamento': agendamento.data_agendamento 
          ? new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')
          : 'Não agendado',
        Status: agendamento.status,
        'Valor Coparticipação': `R$ ${(agendamento.valor_coparticipacao || 0).toFixed(2)}`,
        Pago: agendamento.pago ? 'Sim' : 'Não'
      })) || []
    } catch (error) {
      console.error('Erro ao buscar dados de agendamentos:', error)
      throw error
    }
  }

  static async getDadosRelatorioReembolsos(filtros?: {
    dataInicio?: string
    dataFim?: string
  }) {
    try {
      let query = supabase
        .from('reembolsos')
        .select(`
          *,
          cliente:clientes(
            id,
            cpf,
            usuario:usuarios(id, nome, email)
          )
        `)
        .order('data_solicitacao', { ascending: false })

      if (filtros?.dataInicio) {
        query = query.gte('data_solicitacao', filtros.dataInicio)
      }

      if (filtros?.dataFim) {
        query = query.lte('data_solicitacao', filtros.dataFim)
      }

      const { data, error } = await query

      if (error) throw error

      // Formatar dados para exportação
      return data?.map(reembolso => ({
        ID: reembolso.id,
        Protocolo: reembolso.protocolo || `#REMB-${String(reembolso.id).padStart(4, '0')}`,
        Cliente: reembolso.cliente?.usuario?.nome || 'N/A',
        CPF: reembolso.cliente?.cpf || 'N/A',
        Tipo: reembolso.tipo || 'N/A',
        Especialidade: reembolso.especialidade || 'N/A',
        'Data Solicitação': new Date(reembolso.data_solicitacao).toLocaleDateString('pt-BR'),
        'Valor Solicitado': `R$ ${(reembolso.valor_solicitado || 0).toFixed(2)}`,
        Status: reembolso.status,
        'Data Aprovação': reembolso.data_aprovacao 
          ? new Date(reembolso.data_aprovacao).toLocaleDateString('pt-BR')
          : '-',
        'Motivo Rejeição': reembolso.motivo_rejeicao || '-'
      })) || []
    } catch (error) {
      console.error('Erro ao buscar dados de reembolsos:', error)
      throw error
    }
  }

  static async getDadosRelatorioFinanceiro(filtros?: {
    dataInicio?: string
    dataFim?: string
  }) {
    try {
      // Buscar agendamentos pagos (receitas)
      let queryAgendamentos = supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(usuario:usuarios(nome))
        `)
        .eq('pago', true)

      if (filtros?.dataInicio) {
        queryAgendamentos = queryAgendamentos.gte('data_pagamento', filtros.dataInicio)
      }
      if (filtros?.dataFim) {
        queryAgendamentos = queryAgendamentos.lte('data_pagamento', filtros.dataFim)
      }

      // Buscar reembolsos aprovados (despesas)
      let queryReembolsos = supabase
        .from('reembolsos')
        .select(`
          *,
          cliente:clientes(usuario:usuarios(nome))
        `)
        .eq('status', 'aprovado')

      if (filtros?.dataInicio) {
        queryReembolsos = queryReembolsos.gte('data_aprovacao', filtros.dataInicio)
      }
      if (filtros?.dataFim) {
        queryReembolsos = queryReembolsos.lte('data_aprovacao', filtros.dataFim)
      }

      const [agendamentosRes, reembolsosRes] = await Promise.all([
        queryAgendamentos,
        queryReembolsos
      ])

      if (agendamentosRes.error) throw agendamentosRes.error
      if (reembolsosRes.error) throw reembolsosRes.error

      const transacoes: any[] = []

      // Adicionar receitas (coparticipações)
      agendamentosRes.data?.forEach(a => {
        transacoes.push({
          Data: a.data_pagamento 
            ? new Date(a.data_pagamento).toLocaleDateString('pt-BR')
            : new Date(a.data_solicitacao).toLocaleDateString('pt-BR'),
          Tipo: 'Receita - Coparticipação',
          Descrição: `Agendamento #${a.id}`,
          Cliente: a.cliente?.usuario?.nome || 'N/A',
          Valor: `R$ ${(a.valor_coparticipacao || 0).toFixed(2)}`,
          'Valor Numérico': a.valor_coparticipacao || 0
        })
      })

      // Adicionar despesas (reembolsos)
      reembolsosRes.data?.forEach(r => {
        transacoes.push({
          Data: r.data_aprovacao 
            ? new Date(r.data_aprovacao).toLocaleDateString('pt-BR')
            : new Date(r.data_solicitacao).toLocaleDateString('pt-BR'),
          Tipo: 'Despesa - Reembolso',
          Descrição: `Reembolso ${r.protocolo || '#' + r.id}`,
          Cliente: r.cliente?.usuario?.nome || 'N/A',
          Valor: `R$ -${(r.valor_solicitado || 0).toFixed(2)}`,
          'Valor Numérico': -(r.valor_solicitado || 0)
        })
      })

      // Ordenar por data
      transacoes.sort((a, b) => {
        const dataA = a.Data.split('/').reverse().join('')
        const dataB = b.Data.split('/').reverse().join('')
        return dataB.localeCompare(dataA)
      })

      return transacoes
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error)
      throw error
    }
  }

  static async getDadosRelatorioEspecialidades() {
    try {
      const { data, error } = await supabase
        .from('especialidades')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error

      // Buscar contagem de agendamentos por especialidade
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('especialidade_id')

      const contagemAgendamentos: Record<number, number> = {}
      agendamentos?.forEach(a => {
        if (a.especialidade_id) {
          contagemAgendamentos[a.especialidade_id] = 
            (contagemAgendamentos[a.especialidade_id] || 0) + 1
        }
      })

      return data?.map(esp => ({
        ID: esp.id,
        Nome: esp.nome,
        Descrição: esp.descricao || 'N/A',
        Valor: `R$ ${(esp.valor || 0).toFixed(2)}`,
        'Total Agendamentos': contagemAgendamentos[esp.id] || 0,
        Status: esp.ativo ? 'Ativo' : 'Inativo'
      })) || []
    } catch (error) {
      console.error('Erro ao buscar dados de especialidades:', error)
      throw error
    }
  }

  static async getDadosRelatorioEstabelecimentos() {
    try {
      const { data, error } = await supabase
        .from('estabelecimentos')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error

      // Buscar contagem de agendamentos por estabelecimento
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('estabelecimento_id')

      const contagemAgendamentos: Record<number, number> = {}
      agendamentos?.forEach(a => {
        if (a.estabelecimento_id) {
          contagemAgendamentos[a.estabelecimento_id] = 
            (contagemAgendamentos[a.estabelecimento_id] || 0) + 1
        }
      })

      return data?.map(est => ({
        ID: est.id,
        Nome: est.nome,
        Endereço: est.endereco || 'N/A',
        Cidade: est.cidade || 'N/A',
        Estado: est.estado || 'N/A',
        Telefone: est.telefone || 'N/A',
        Email: est.email || 'N/A',
        'Total Agendamentos': contagemAgendamentos[est.id] || 0,
        Status: est.ativo ? 'Ativo' : 'Inativo'
      })) || []
    } catch (error) {
      console.error('Erro ao buscar dados de estabelecimentos:', error)
      throw error
    }
  }

  // ==================== RELATÓRIOS - GERENCIAR HISTÓRICO ====================

  static async getRelatoriosGerados() {
    try {
      // Se você criar a tabela relatorios_gerados no Supabase
      const { data, error } = await supabase
        .from('relatorios_gerados')
        .select(`
          *,
          usuario:usuarios(nome)
        `)
        .order('data_geracao', { ascending: false })
        .limit(20)

      if (error) {
        // Se a tabela não existir, retornar dados simulados
        console.log('Tabela relatorios_gerados não existe, usando dados simulados')
        return [
          {
            id: 1,
            tipo: 'Financeiro Completo',
            periodo: 'Novembro/2025',
            formato: 'PDF',
            arquivo_url: '#',
            usuario: { nome: 'Administrador' },
            data_geracao: new Date().toISOString()
          },
          {
            id: 2,
            tipo: 'Agendamentos',
            periodo: 'Últimos 3 Meses',
            formato: 'Excel',
            arquivo_url: '#',
            usuario: { nome: 'Administrador' },
            data_geracao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            tipo: 'Clientes',
            periodo: 'Este Ano',
            formato: 'CSV',
            arquivo_url: '#',
            usuario: { nome: 'Administrador' },
            data_geracao: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar relatórios gerados:', error)
      // Retornar dados simulados em caso de erro
      return []
    }
  }

  static async salvarRelatorioGerado(dados: {
    tipo: string
    periodo: string
    formato: string
    arquivo_url: string
    usuario_id: string
  }) {
    try {
      const { data, error } = await supabase
        .from('relatorios_gerados')
        .insert({
          tipo: dados.tipo,
          periodo: dados.periodo,
          formato: dados.formato,
          arquivo_url: dados.arquivo_url,
          usuario_id: dados.usuario_id,
          data_geracao: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao salvar relatório gerado:', error)
      throw error
    }
  }

  static async deletarRelatorioGerado(id: number) {
    try {
      const { error } = await supabase
        .from('relatorios_gerados')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar relatório:', error)
      throw error
    }
  }

  // ==================== UTILITÁRIO - EXPORTAR CSV ====================

  static exportarCSV(dados: any[], nomeArquivo: string) {
    if (dados.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }

    try {
      // Pegar as chaves do primeiro objeto
      const headers = Object.keys(dados[0])
      
      // Criar linhas CSV
      const csv = [
        headers.join(','), // Header
        ...dados.map(row => 
          headers.map(header => {
            let value = row[header]
            
            // Converter para string e remover quebras de linha
            value = String(value || '').replace(/\n/g, ' ').replace(/\r/g, '')
            
            // Tratar valores que possam conter vírgulas ou aspas
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              value = `"${value.replace(/"/g, '""')}"`
            }
            
            return value
          }).join(',')
        )
      ].join('\n')

      // Adicionar BOM para UTF-8
      const BOM = '\uFEFF'
      const csvContent = BOM + csv

      // Criar blob e fazer download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${nomeArquivo}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      return { success: true, message: 'Arquivo CSV exportado com sucesso!' }
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      throw error
    }
  }

    // ==================== INDICAÇÕES - BUSCAR ====================

  static async getIndicacoesPendentes() {
    try {
      const { data, error } = await supabase
        .from('indicacoes')
        .select(`
          *,
          cliente:clientes(
            id,
            cpf,
            usuario:usuarios(id, nome, email, telefone)
          )
        `)
        .eq('status', 'pendente')
        .order('data_indicacao', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao buscar indicações pendentes:', error)
      throw error
    }
  }

  static async getAllIndicacoes(filtros?: {
    status?: string
    dataInicio?: string
    dataFim?: string
  }) {
    try {
      let query = supabase
        .from('indicacoes')
        .select(`
          *,
          cliente:clientes(
            id,
            cpf,
            usuario:usuarios(id, nome, email, telefone)
          )
        `)

      if (filtros?.status) {
        query = query.eq('status', filtros.status)
      }

      if (filtros?.dataInicio) {
        query = query.gte('data_indicacao', filtros.dataInicio)
      }

      if (filtros?.dataFim) {
        query = query.lte('data_indicacao', filtros.dataFim)
      }

      const { data, error } = await query.order('data_indicacao', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao buscar indicações:', error)
      throw error
    }
  }

  static async getIndicacoesPorCliente(clienteId: number) {
    try {
      const { data, error } = await supabase
        .from('indicacoes')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('data_indicacao', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao buscar indicações do cliente:', error)
      throw error
    }
  }

  // ==================== INDICAÇÕES - CRIAR ====================

  static async createIndicacao(dados: {
    cliente_id: number
    nome_estabelecimento: string
    tipo_estabelecimento?: string
    endereco: string
    cidade: string
    estado: string
    telefone?: string
    email?: string
    observacoes?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('indicacoes')
        .insert({
          ...dados,
          status: 'pendente',
          data_indicacao: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Criar notificação para admin
      const { data: adminUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('tipo_usuario', 'admin')
        .limit(1)
        .single()

      if (adminUser) {
        await this.createNotificacao({
          usuario_id: adminUser.id,
          titulo: 'Nova Indicação de Estabelecimento',
          mensagem: `Um cliente indicou um novo estabelecimento: ${dados.nome_estabelecimento}`,
          tipo: 'info',
          link: '/admin/estabelecimentos/indicados',
        })
      }

      return data
    } catch (error) {
      console.error('Erro ao criar indicação:', error)
      throw error
    }
  }

  // ==================== INDICAÇÕES - APROVAR ====================

  static async aprovarIndicacao(
    id: number,
    observacoes_admin?: string
  ) {
    try {
      // 1. Buscar dados da indicação
      const { data: indicacao, error: fetchError } = await supabase
        .from('indicacoes')
        .select(`
          *,
          cliente:clientes(
            id,
            usuario:usuarios(id, nome)
          )
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // 2. Atualizar status da indicação
      const { error: updateError } = await supabase
        .from('indicacoes')
        .update({
          status: 'aprovado',
          data_aprovacao: new Date().toISOString(),
          observacoes_admin,
        })
        .eq('id', id)

      if (updateError) throw updateError

      // 3. Criar estabelecimento
      const { data: estabelecimento, error: estabelecimentoError } = await supabase
        .from('estabelecimentos')
        .insert({
          nome: indicacao.nome_estabelecimento,
          endereco: indicacao.endereco,
          cidade: indicacao.cidade,
          estado: indicacao.estado,
          telefone: indicacao.telefone,
          email: indicacao.email,
          tipo: indicacao.tipo_estabelecimento || 'Clínica',
          observacoes: `Indicado por: ${indicacao.cliente?.usuario?.nome || 'Cliente'}`,
          ativo: true,
        })
        .select()
        .single()

      if (estabelecimentoError) throw estabelecimentoError

      // 4. Notificar cliente
      if (indicacao.cliente?.usuario?.id) {
        await this.createNotificacao({
          usuario_id: indicacao.cliente.usuario.id,
          titulo: 'Indicação Aprovada',
          mensagem: `Sua indicação de estabelecimento "${indicacao.nome_estabelecimento}" foi aprovada e cadastrada no sistema!`,
          tipo: 'sucesso',
          link: '/cliente/indicacoes',
        })
      }

      return { indicacao, estabelecimento }
    } catch (error) {
      console.error('Erro ao aprovar indicação:', error)
      throw error
    }
  }

  // ==================== INDICAÇÕES - REPROVAR ====================

  static async reprovarIndicacao(
    id: number,
    motivo_reprovacao: string
  ) {
    try {
      // 1. Buscar dados da indicação
      const { data: indicacao, error: fetchError } = await supabase
        .from('indicacoes')
        .select(`
          *,
          cliente:clientes(usuario:usuarios(id))
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // 2. Atualizar status
      const { data, error } = await supabase
        .from('indicacoes')
        .update({
          status: 'reprovado',
          data_reprovacao: new Date().toISOString(),
          motivo_reprovacao,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // 3. Notificar cliente
      if (indicacao.cliente?.usuario?.id) {
        await this.createNotificacao({
          usuario_id: indicacao.cliente.usuario.id,
          titulo: 'Indicação Reprovada',
          mensagem: `Sua indicação de estabelecimento foi reprovada. Motivo: ${motivo_reprovacao}`,
          tipo: 'erro',
          link: '/cliente/indicacoes',
        })
      }

      return data
    } catch (error) {
      console.error('Erro ao reprovar indicação:', error)
      throw error
    }
  }

  // ==================== INDICAÇÕES - ESTATÍSTICAS ====================

  static async getIndicacoesStats() {
    try {
      const { data: indicacoes, error } = await supabase
        .from('indicacoes')
        .select('*')

      if (error) throw error

      const hoje = new Date()
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

      const total = indicacoes?.length || 0
      const pendentes = indicacoes?.filter(i => i.status === 'pendente').length || 0
      const aprovadas = indicacoes?.filter(i => i.status === 'aprovado').length || 0
      const reprovadas = indicacoes?.filter(i => i.status === 'reprovado').length || 0

      const esteMes = indicacoes?.filter(i => {
        const data = new Date(i.data_indicacao)
        return data >= primeiroDiaMes
      }).length || 0

      const taxaAprovacao = total > 0
        ? ((aprovadas / total) * 100).toFixed(1)
        : '0.0'

      return {
        total,
        pendentes,
        aprovadas,
        reprovadas,
        esteMes,
        taxaAprovacao: parseFloat(taxaAprovacao)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de indicações:', error)
      throw error
    }
  }


  // ==================== UTILITÁRIO - OBTER DADOS PARA RELATÓRIO ====================

  static async getDadosParaRelatorio(
    tipo: string,
    filtros?: { dataInicio?: string; dataFim?: string }
  ) {
    try {
      switch (tipo) {
        case 'clientes':
          return await this.getDadosRelatorioClientes(filtros)
        
        case 'agendamentos':
          return await this.getDadosRelatorioAgendamentos(filtros)
        
        case 'reembolsos':
          return await this.getDadosRelatorioReembolsos(filtros)
        
        case 'financeiro':
          return await this.getDadosRelatorioFinanceiro(filtros)
        
        case 'especialidades':
          return await this.getDadosRelatorioEspecialidades()
        
        case 'estabelecimentos':
          return await this.getDadosRelatorioEstabelecimentos()
        
        default:
          throw new Error(`Tipo de relatório não suportado: ${tipo}`)
      }
    } catch (error) {
      console.error('Erro ao obter dados para relatório:', error)
      throw error
    }
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

  // ==================== EMPRESAS ====================

  static async getEmpresas() {
    const { data, error } = await supabase
      .from('empresas')
      .select(`
        *
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async postarEmpresa(empresa: {
    razao_social: string
    cnpj: string
    email: string
    telefone: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
  }) {
    const { data, error } = await supabase
      .from('empresas')
      .insert(empresa)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==================== ESTABELECIMENTOS ====================
  
  static async postarEstabelecimento(estabelecimento: {
    nome: string
    endereco: string
    cidade: string
    estado: string
    cep?: string
    telefone?: string
    especialidades: number[] // IDs das especialidades
  }) {
    const { data, error } = await supabase
      .from('estabelecimentos')
      .insert(estabelecimento)
      .select()
      .single()

    if (error) throw error
    return data
  }
  static async getAgendamentoPendentes() {
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

  static async getAllEstabelecimentos() {
    const { data, error } = await supabase
      .from('estabelecimentos')
      .select(`
        *
      `)
      .order('nome')

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
  // ==================== INFORMAR PAGAMENTO ====================

static async informarPagamento(agendamentoId: number) {
  try {
    // 1. Marcar que cliente informou pagamento
    const { error: updateError } = await supabase
      .from('agendamentos')
      .update({
        cliente_informou_pagamento: true,
        data_informacao_pagamento: new Date().toISOString()
      })
      .eq('id', agendamentoId)

    if (updateError) {
      console.error('Erro ao atualizar agendamento:', updateError)
      throw updateError
    }

    // 2. Buscar admin para notificar
    const { data: adminUser, error: adminError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('tipo_usuario', 'admin')
      .limit(1)
      .single()

    if (adminError) {
      console.error('Erro ao buscar admin:', adminError)
    }

    // 3. Criar notificação para admin
    if (adminUser) {
      await this.createNotificacao({
        usuario_id: adminUser.id,
        titulo: 'Cliente Informou Pagamento',
        mensagem: `O cliente informou que realizou o pagamento do agendamento #${agendamentoId}. Verifique e confirme.`,
        tipo: 'alerta',
        link: `/admin/agendamentos/${agendamentoId}`,
      })
    }

    // 4. Retornar sucesso
    return { success: true, message: 'Pagamento informado com sucesso!' }
  } catch (error) {
    console.error('Erro ao informar pagamento:', error)
    throw error
  }
}
}