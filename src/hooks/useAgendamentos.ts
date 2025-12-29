import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/services/api.service'
import type { NovoAgendamento } from '@/types'
import { useAuth } from './useAuth'

export const useAgendamentos = () => {
  const { cliente } = useAuth()
  const queryClient = useQueryClient()

  const { data: agendamentos, isLoading, error } = useQuery({
    queryKey: ['agendamentos', cliente?.id],
    queryFn: () => ApiService.getAgendamentos(cliente!.id),
    enabled: !!cliente?.id,
  })

  const createMutation = useMutation({
    mutationFn: (data: NovoAgendamento) => ApiService.createAgendamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (agendamentoId: number) => ApiService.cancelarAgendamento(agendamentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
    },
  })

  return {
    agendamentos: agendamentos || [],
    isLoading,
    error,
    criar: createMutation.mutateAsync,
    cancelar: cancelMutation.mutateAsync,
    isCriando: createMutation.isPending,
    isCancelando: cancelMutation.isPending,
  }
}
