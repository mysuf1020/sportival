import httpClient from '@/lib/http-request'
import { ApiResponse, PaginatedApiResponse } from '@/lib/models/api'
import { User, CreateUserPayload, UpdateUserPayload } from '@/lib/models/user'

export const getUsers = async (page = 1, perPage = 10): Promise<PaginatedApiResponse<User[]>> => {
  const { data } = await httpClient.get('/users', { params: { page, per_page: perPage } })
  return data
}

export const getUserById = async (id: number): Promise<ApiResponse<User>> => {
  const { data } = await httpClient.get(`/users/${id}`)
  return data
}

export const createUser = async (payload: CreateUserPayload): Promise<ApiResponse<User>> => {
  const { data } = await httpClient.post('/users', payload)
  return data
}

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<ApiResponse<User>> => {
  const { data } = await httpClient.put(`/users/${id}`, payload)
  return data
}

export const deleteUser = async (id: number): Promise<ApiResponse<null>> => {
  const { data } = await httpClient.delete(`/users/${id}`)
  return data
}
