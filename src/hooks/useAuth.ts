import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, Cliente } from '@/types'
import { AuthService } from '@/services/auth.service'
import { supabase } from '@/config/supabase'

interface AuthStore {
  user: Usuario | null
  cliente: Cliente | null
  loading: boolean
  isAuthenticated: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  cadastrar: (dados: any) => Promise<void>
  initialize: () => Promise<void>
  updateCliente: (dados: Partial<Cliente>) => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      cliente: null,
      loading: true,
      isAuthenticated: false,

      initialize: async () => {
        try {
          set({ loading: true })
          const session = await AuthService.getSession()

          if (session?.user) {
            const userData = await AuthService.getUserData(session.user.id)
            console.log('✅ Autenticação inicializada:', userData)
            set({
              user: userData.usuario,
              cliente: userData.cliente,
              isAuthenticated: true,
              loading: false,
            })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('Erro ao inicializar autenticação:', error)
          set({ loading: false })
        }
      },

      login: async (email, password) => {
        try {
          set({ loading: true })
          const result = await AuthService.login({ email, password })

          set({
            user: result.user as any,
            cliente: result.cliente,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await AuthService.logout()
          set({
            user: null,
            cliente: null,
            isAuthenticated: false,
          })
        } catch (error) {
          console.error('Erro ao fazer logout:', error)
          throw error
        }
      },

      cadastrar: async (dados) => {
        try {
          set({ loading: true })
          const result = await AuthService.cadastrarCliente(dados)

          set({
            user: result.usuario,
            cliente: result.cliente,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateCliente: (dados) => {
        const currentCliente = get().cliente
        if (currentCliente) {
          set({ cliente: { ...currentCliente, ...dados } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        cliente: state.cliente,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Hook para usar no App.tsx
export const useInitializeAuth = () => {
  const initialize = useAuth((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])
}

// Hook para escutar mudanças de autenticação
export const useAuthListener = () => {
  const { initialize } = useAuth()

  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        initialize()
      } else if (event === 'SIGNED_OUT') {
        useAuth.setState({
          user: null,
          cliente: null,
          isAuthenticated: false,
        })
      }
    })
  }

  return { setupAuthListener }
}
