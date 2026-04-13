import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi, type CreateUserDto } from '@infrastructure/api/users.api'
import { queryKeys } from '@shared/constants/queryKeys'

export const useUsers = (page = 1, pageSize = 20) =>
  useQuery({
    queryKey: queryKeys.users.list({ page, pageSize }),
    queryFn: () => usersApi.list(page, pageSize),
  })

export const useUser = (id: string) =>
  useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateUserDto) => usersApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export const useUpdateAvatarMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, avatarUrl }: { id: string; avatarUrl: string | null }) =>
      usersApi.updateAvatar(id, avatarUrl),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
    },
  })
}
