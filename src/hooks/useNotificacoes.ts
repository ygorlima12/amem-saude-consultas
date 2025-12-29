import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import { useAuth } from './useAuth'

export const useNotificacoes = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: notificacoes, isLoading } = useQuery({
    queryKey: ['notificacoes', user?.id],
    queryFn: () => ApiService.getNotificacoes(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  })

  const marcarLidaMutation = useMutation({
    mutationFn: (notificacaoId: number) => ApiService.marcarComoLida(notificacaoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    },
  })

  const marcarTodasLidasMutation = useMutation({
    mutationFn: () => ApiService.marcarTodasComoLidas(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    },
  })

  const naoLidas = notificacoes?.filter((n) => !n.lida) || []

  return {
    notificacoes: notificacoes || [],
    naoLidas,
    countNaoLidas: naoLidas.length,
    isLoading,
    marcarLida: marcarLidaMutation.mutateAsync,
    marcarTodasLidas: marcarTodasLidasMutation.mutateAsync,
  }
}
