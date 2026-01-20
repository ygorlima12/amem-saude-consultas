import { supabase } from '@/config/supabase'
import { isDevelopmentMode, mockUsuario, mockCliente, mockAdmin } from '@/config/dev-mode'
import type { Usuario, Cliente, LoginForm, CadastroClienteForm } from '@/types'

export class AuthService {
  static async login(credentials: LoginForm) {
  if (isDevelopmentMode()) {
    console.log('🔧 Modo desenvolvimento')
    await new Promise(resolve => setTimeout(resolve, 500))

    if (credentials.email === 'demo@admin.com') {
      return { 
        user: { id: 'mock-admin-uuid' } as any, 
        usuario: mockAdmin, 
        cliente: null 
      }
    } else {
      return { 
        user: { id: 'mock-uuid' } as any, 
        usuario: mockUsuario, 
        cliente: mockCliente 
      }
    }
  }

  try {
    // 1. Login no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Erro ao fazer login')

    console.log('✅ Auth bem-sucedido')

    // 2. Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', credentials.email)
      .single()

    if (userError || !userData) {
      throw new Error('Usuário não encontrado no banco de dados')
    }

    console.log('✅ Usuário encontrado:', {
      id: userData.id,
      email: userData.email,
      tipo_usuario: userData.tipo_usuario
    })

    // 3. Atualizar auth_user_id se necessário
    if (!userData.auth_user_id) {
      await supabase
        .from('usuarios')
        .update({ auth_user_id: authData.user.id })
        .eq('id', userData.id)
    }

    // 4. Buscar cliente SE for tipo cliente
    let clienteData = null
    if (userData.tipo_usuario === 'cliente') {
      console.log('🔵 Buscando dados do cliente...')
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('usuario_id', userData.id)
        .maybeSingle()
      
      clienteData = data
      console.log('Cliente encontrado:', clienteData ? 'Sim' : 'Não')
    } else {
      console.log('⚠️ Não é cliente, pulando busca de cliente')
    }

    const resultado = {
      user: authData.user,
      usuario: userData as Usuario,
      cliente: clienteData as Cliente | null
    }

    console.log('✅ Login completo:', {
      tipo_usuario: resultado.usuario.tipo_usuario,
      tem_cliente: !!resultado.cliente
    })

    return resultado
  } catch (error) {
    console.error('❌ Erro no login (AuthService):', error)
    throw error
  }
}

  static async cadastrarCliente(dados: CadastroClienteForm) {
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento - Cadastro simulado')
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        user: { id: 'mock-uuid-' + Date.now() } as any,
        usuario: { ...mockUsuario, nome: dados.nome, email: dados.email },
        cliente: mockCliente,
      }
    }

    try {
      console.log('🔵 1. Criando usuário no Auth...')
      
      // ✅ Configurar redirect para produção
      const redirectUrl = window.location.origin.includes('localhost')
        ? 'http://localhost:5173/login'
        : 'https://app.consultas.amemsaude.com/login'

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
        options: { 
          data: { nome: dados.nome },
          emailRedirectTo: redirectUrl  // ✅ Redirect correto!
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      console.log('🔵 2. Criando registro (nome + email)...')
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({ 
          nome: dados.nome, 
          email: dados.email
        })
        .select()
        .single()

      if (userError) {
        console.error('❌ Erro:', userError)
        throw userError
      }

      console.log('🔵 3. Atualizando campos...')
      await supabase.from('usuarios').update({
        auth_user_id: authData.user.id,
        tipo_usuario: 'cliente',
        telefone: dados.telefone,
        ativo: true
      }).eq('id', userData.id)

      console.log('🔵 4. Criando cliente...')
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          usuario_id: userData.id,
          cpf: dados.cpf,
          tipo_pessoa: 'fisica',
          data_nascimento: dados.dataNascimento || null,
          endereco: dados.endereco || null,
          cidade: dados.cidade || null,
          estado: dados.estado || null,
          cep: dados.cep || null,
          data_entrada: new Date().toISOString().split('T')[0],
          ativo: true,
        })
        .select()
        .single()

      if (clienteError) throw clienteError

      console.log('✅ Cadastro completo!')
      return { user: authData.user, usuario: userData as Usuario, cliente: clienteData as Cliente }
    } catch (error) {
      console.error('❌ Erro no cadastro:', error)
      throw error
    }
  }

  static async logout() {
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento - Logout simulado')
      return
    }

    try {
      // Verificar se tem sessão antes de tentar logout
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Não tem sessão, apenas limpar storage local
        console.log('⚠️ Sem sessão ativa - limpando storage')
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
        return
      }
      
      // Tem sessão, fazer logout normal
      const { error } = await supabase.auth.signOut()
      
      if (error && !error.message.includes('session missing')) {
        throw error
      }
      
      console.log('✅ Logout realizado com sucesso')
    } catch (error: any) {
      // Se for erro de sessão ausente, considerar sucesso
      if (error.message?.includes('session missing') || 
          error.name === 'AuthSessionMissingError') {
        console.log('⚠️ Sessão já expirada - limpando dados locais')
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
        return
      }
      
      console.error('❌ Erro ao fazer logout:', error)
      // Mesmo com erro, limpar dados locais
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
    }
  }

  static async getSession() {
    if (isDevelopmentMode()) return null
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  }

  static async getCurrentUser() {
    if (isDevelopmentMode()) return null
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  static async getUserData(authUserId: string) {
    if (isDevelopmentMode()) return { usuario: mockUsuario, cliente: mockCliente }

    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

      if (userError) throw userError

      let clienteData = null
      if (userData.tipo_usuario === 'cliente') {
        const { data } = await supabase.from('clientes').select('*').eq('usuario_id', userData.id).maybeSingle()
        clienteData = data
      }

      return { usuario: userData as Usuario, cliente: clienteData as Cliente | null }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      throw error
    }
  }

  static async resetPassword(email: string) {
    if (isDevelopmentMode()) return
    
    const redirectUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:5173/reset-password'
      : 'https://app.consultas.amemsaude.com/reset-password'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    if (error) throw error
  }

  static async updatePassword(newPassword: string) {
    if (isDevelopmentMode()) return
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }
}