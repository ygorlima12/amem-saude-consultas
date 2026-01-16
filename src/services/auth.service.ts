import { supabase } from '@/config/supabase'
import { isDevelopmentMode, mockUsuario, mockCliente, mockAdmin } from '@/config/dev-mode'
import type { Usuario, Cliente, LoginForm, CadastroClienteForm } from '@/types'

export class AuthService {
  static async login(credentials: LoginForm) {
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento ativo - Usando dados mock')
      await new Promise(resolve => setTimeout(resolve, 500))

      if (credentials.email === 'demo@admin.com') {
        return { user: { id: 'mock-admin-uuid-999' } as any, usuario: mockAdmin, cliente: null }
      } else {
        return { user: { id: 'mock-uuid-123' } as any, usuario: mockUsuario, cliente: mockCliente }
      }
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao fazer login')

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', credentials.email)
        .single()

      if (userError || !userData) {
        const { data: novoUsuario, error: criarError } = await supabase
          .from('usuarios')
          .insert({ nome: authData.user.user_metadata?.nome || credentials.email.split('@')[0], email: credentials.email })
          .select()
          .single()

        if (criarError) throw criarError

        await supabase.from('usuarios').update({ auth_user_id: authData.user.id, tipo_usuario: 'cliente', telefone: '', ativo: true }).eq('id', novoUsuario.id)

        return { user: authData.user, usuario: novoUsuario as Usuario, cliente: null }
      }

      if (!userData.auth_user_id) {
        await supabase.from('usuarios').update({ auth_user_id: authData.user.id }).eq('id', userData.id)
      }

      let clienteData = null
      if (userData.tipo_usuario === 'cliente') {
        const { data } = await supabase.from('clientes').select('*').eq('usuario_id', userData.id).maybeSingle()
        clienteData = data
      }

      return { user: authData.user, usuario: userData as Usuario, cliente: clienteData as Cliente | null }
    } catch (error) {
      console.error('Erro no login:', error)
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
        options: { data: { nome: dados.nome } }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      console.log('🔵 2. Criando registro (nome + email)...')
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({ nome: dados.nome, email: dados.email })
        .select()
        .single()

      if (userError) throw userError

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
    if (isDevelopmentMode()) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  static async updatePassword(newPassword: string) {
    if (isDevelopmentMode()) return
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }
}