'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '@/lib/apis/user'
import { CreateUserPayload, UpdateUserPayload } from '@/lib/models/user'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (page: number, perPage: number) => [...userKeys.lists(), { page, perPage }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
}

export function useUsers(page = 1, perPage = 10) {
  return useQuery({ queryKey: userKeys.list(page, perPage), queryFn: () => getUsers(page, perPage) })
}

export function useUser(id: number) {
  return useQuery({ queryKey: userKeys.detail(id), queryFn: () => getUserById(id), enabled: !!id })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (p: CreateUserPayload) => createUser(p), onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }) })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) => updateUser(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }) })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: number) => deleteUser(id), onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }) })
}
