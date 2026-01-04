import { supabase } from '@/config/supabase'
import { isDevelopmentMode, mockUsuario, mockCliente, mockAdmin } from '@/config/dev-mode'
import type { Usuario, Cliente, LoginForm, CadastroClienteForm } from '@/types'

export class AuthService {
  /**
   * Faz login do usuário
   */
  static async login(credentials: LoginForm) {
    // Modo de desenvolvimento - login com dados mock
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento ativo - Usando dados mock')
      console.log('Use: demo@cliente.com ou demo@admin.com (qualquer senha)')

      await new Promise(resolve => setTimeout(resolve, 500)) // Simula delay

      if (credentials.email === 'demo@admin.com') {
        return {
          user: { id: 'mock-admin-uuid-999' } as any,
          usuario: mockAdmin,
          cliente: null,
        }
      } else {
        return {
          user: { id: 'mock-uuid-123' } as any,
          usuario: mockUsuario,
          cliente: mockCliente,
        }
      }
    }

    // Modo produção - login real com Supabase
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao fazer login')

      // Buscar dados do usuário na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single()

      if (userError) {
        // Se não encontrou, criar o registro
        const { data: novoUsuario, error: criarError } = await supabase
          .from('usuarios')
          .insert({
            auth_user_id: authData.user.id,
            email: credentials.email,
            nome: authData.user.user_metadata?.nome || credentials.email.split('@')[0],
            tipo_usuario: 'cliente',
          })
          .select()
          .single()

        if (criarError) throw criarError

        return {
          user: authData.user,
          usuario: novoUsuario as Usuario,
          cliente: null,
        }
      }

      let clienteData = null
      if (userData.tipo_usuario === 'cliente') {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('usuario_id', userData.id)
          .single()

        if (!error) clienteData = data
      }

      return {
        user: authData.user,
        usuario: userData as Usuario,
        cliente: clienteData as Cliente | null,
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  /**
   * Cadastra um novo cliente
   */
  static async cadastrarCliente(dados: CadastroClienteForm) {
    // Modo de desenvolvimento
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento - Cadastro simulado')
      await new Promise(resolve => setTimeout(resolve, 500))

      const novoCliente = {
        ...mockCliente,
        id: Date.now(),
        usuario_id: 'mock-uuid-' + Date.now(),
      }

      const novoUsuario = {
        ...mockUsuario,
        id: 'mock-uuid-' + Date.now(),
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
      }

      return {
        user: { id: novoUsuario.id } as any,
        usuario: novoUsuario,
        cliente: novoCliente,
      }
    }

    // Modo produção
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
        options: {
          data: {
            nome: dados.nome,
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Criar registro na tabela usuarios MANUALMENTE
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          auth_user_id: authData.user.id,
          email: dados.email,
          nome: dados.nome,
          telefone: dados.telefone,
          tipo_usuario: 'cliente',
        })
        .select()
        .single()

      if (userError) {
        console.error('Erro ao criar usuário:', userError)
        throw userError
      }

      // 3. Criar registro de cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          usuario_id: userData.id,
          cpf: dados.cpf,
          data_nascimento: dados.dataNascimento || null,
          endereco: dados.endereco || null,
          cidade: dados.cidade || null,
          estado: dados.estado || null,
          cep: dados.cep || null,
        })
        .select()
        .single()

      if (clienteError) {
        console.error('Erro ao criar cliente:', clienteError)
        throw clienteError
      }

      return {
        user: authData.user,
        usuario: userData as Usuario,
        cliente: clienteData as Cliente,
      }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  /**
   * Faz logout do usuário
   */
  static async logout() {
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento - Logout simulado')
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Obtém a sessão atual
   */
  static async getSession() {
    if (isDevelopmentMode()) {
      return null
    }

    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  }

  /**
   * Obtém o usuário atual
   */
  static async getCurrentUser() {
    if (isDevelopmentMode()) {
      return null
    }

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  /**
   * Obtém dados completos do usuário logado
   */
  static async getUserData(authUserId: string) {
    if (isDevelopmentMode()) {
      return {
        usuario: mockUsuario,
        cliente: mockCliente,
      }
    }

    try {
      // Buscar usuário pela auth_user_id
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

      if (userError) throw userError

      let clienteData = null
      if (userData.tipo_usuario === 'cliente') {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('usuario_id', userData.id)
          .single()

        if (!error) clienteData = data
      }

      return {
        usuario: userData as Usuario,
        cliente: clienteData as Cliente | null,
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      throw error
    }
  }

  /**
   * Reseta a senha do usuário
   */
  static async resetPassword(email: string) {
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento - Reset de senha simulado')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  /**
   * Atualiza a senha do usuário
   */
  static async updatePassword(newPassword: string) {
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento - Atualização de senha simulada')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  }
}