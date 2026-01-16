import { supabase } from '@/config/supabase'
import { isDevelopmentMode, mockUsuario, mockCliente, mockAdmin } from '@/config/dev-mode'
import type { Usuario, Cliente, LoginForm, CadastroClienteForm } from '@/types'

export class AuthService {
  /**
   * Faz login do usuário
   */
  static async login(credentials: LoginForm) {
    if (isDevelopmentMode()) {
      console.log('🔧 Modo de desenvolvimento ativo - Usando dados mock')
      await new Promise(resolve => setTimeout(resolve, 500))

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

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao fazer login')

      // Buscar dados do usuário - TENTA por auth_user_id primeiro
      let userData = null
      let userError = null

      try {
        const result = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .single()

        userData = result.data
        userError = result.error
      } catch (err) {
        // Se der erro de cache, buscar por email
        console.warn('⚠️ Erro ao buscar por auth_user_id, tentando por email...')
        const result = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', credentials.email)
          .single()

        userData = result.data
        userError = result.error

        // Se encontrou por email, atualizar auth_user_id
        if (userData && !userData.auth_user_id) {
          await supabase
            .from('usuarios')
            .update({ auth_user_id: authData.user.id })
            .eq('id', userData.id)
        }
      }

      if (userError || !userData) {
        // Se não encontrou, criar o registro
        const { data: novoUsuario, error: criarError } = await supabase
          .from('usuarios')
          .insert({
            email: credentials.email,
            nome: authData.user.user_metadata?.nome || credentials.email.split('@')[0],
            tipo_usuario: 'cliente',
          })
          .select()
          .single()

        if (criarError) throw criarError

        // Atualizar com auth_user_id depois
        await supabase
          .from('usuarios')
          .update({ auth_user_id: authData.user.id })
          .eq('id', novoUsuario.id)

        return {
          user: authData.user,
          usuario: novoUsuario as Usuario,
          cliente: null,
        }
      }

      // ✅ CORRETO: Buscar cliente por usuario_id (sua estrutura atual)
      let clienteData = null
      if (userData.tipo_usuario === 'cliente') {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('usuario_id', userData.id)
          .maybeSingle()

        if (error) {
          console.error('Erro ao buscar cliente:', error)
        } else if (data) {
          clienteData = data
          console.log('✅ Cliente encontrado:', clienteData)
        } else {
          console.warn('⚠️ Cliente não encontrado para usuario_id:', userData.id)
        }
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
   * ✅ CORRIGIDO: INSERT sem auth_user_id, depois UPDATE
   */
  static async cadastrarCliente(dados: CadastroClienteForm) {
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

    try {
      console.log('🔵 1. Criando usuário no Supabase Auth...')

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

      console.log('✅ Auth user criado:', authData.user.id)
      console.log('🔵 2. Criando registro em usuarios (sem auth_user_id)...')

      // 2. Criar registro na tabela usuarios SEM auth_user_id
      // Isso contorna o erro de cache PGRST204
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          // ❌ NÃO incluir auth_user_id aqui (causa erro de cache!)
          email: dados.email,
          nome: dados.nome,
          telefone: dados.telefone,
          tipo_usuario: 'cliente',
        })
        .select()
        .single()

      if (userError) {
        console.error('❌ Erro ao criar usuário:', userError)
        throw userError
      }

      console.log('✅ Usuario criado:', userData.id)
      console.log('🔵 3. Atualizando usuario com auth_user_id...')

      // 3. ATUALIZAR com auth_user_id (UPDATE funciona, INSERT não!)
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          auth_user_id: authData.user.id
        })
        .eq('id', userData.id)

      if (updateError) {
        console.warn('⚠️ Erro ao atualizar auth_user_id (não crítico):', updateError)
        // Não lançar erro - usuário foi criado com sucesso
      } else {
        console.log('✅ auth_user_id vinculado com sucesso')
      }

      console.log('🔵 4. Criando registro em clientes...')

      // 4. Criar registro de cliente - usa usuario_id (sua estrutura)
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          usuario_id: userData.id,  // ✅ Sua estrutura usa usuario_id
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

      if (clienteError) {
        console.error('❌ Erro ao criar cliente:', clienteError)
        throw clienteError
      }

      console.log('✅ Cliente criado com sucesso!')
      console.log('✅ Cadastro completo!')

      return {
        user: authData.user,
        usuario: userData as Usuario,
        cliente: clienteData as Cliente,
      }
    } catch (error) {
      console.error('❌ Erro no cadastro:', error)
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
   * ✅ CORRIGIDO: Fallback para buscar por email se auth_user_id falhar
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
      let userData = null
      let userError = null

      try {
        const result = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_user_id', authUserId)
          .single()

        userData = result.data
        userError = result.error
      } catch (err) {
        // Se falhar, não tem alternativa sem o email
        console.error('Erro ao buscar por auth_user_id:', err)
        throw err
      }

      if (userError) throw userError

      // ✅ CORRETO: Buscar cliente por usuario_id (sua estrutura atual)
      let clienteData = null
      if (userData.tipo_usuario === 'cliente') {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('usuario_id', userData.id)
          .maybeSingle()

        if (error) {
          console.error('Erro ao buscar cliente:', error)
        } else if (data) {
          clienteData = data
          console.log('✅ Cliente carregado:', clienteData)
        } else {
          console.warn('⚠️ Cliente não encontrado para usuario_id:', userData.id)
        }
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