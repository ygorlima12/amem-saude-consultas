import { supabase } from '@/config/supabase'
import type { Usuario, Cliente, LoginForm, CadastroClienteForm } from '@/types'

export class AuthService {
  /**
   * Faz login do usuário
   */
  static async login(credentials: LoginForm) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) throw authError

      // Buscar dados do usuário e cliente
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', credentials.email)
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
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Criar registro na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          nome: dados.nome,
          email: dados.email,
          senha_hash: '', // Hash será gerenciado pelo Supabase Auth
          tipo_usuario: 'cliente',
          telefone: dados.telefone,
        })
        .select()
        .single()

      if (userError) throw userError

      // 3. Criar registro na tabela clientes
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

      if (clienteError) throw clienteError

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
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Obtém a sessão atual
   */
  static async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  }

  /**
   * Obtém o usuário atual
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  /**
   * Obtém dados completos do usuário logado
   */
  static async getUserData(userId: string) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  /**
   * Atualiza a senha do usuário
   */
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  }
}
