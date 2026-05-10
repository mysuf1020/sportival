import httpClient from '@/lib/http-request'
import type { ApiResponse, AuthUser } from '@/lib/types'

export const login = (username: string, password: string) =>
  httpClient.post<ApiResponse<{ user: AuthUser; token: string }>>('/auth/login', { username, password })

export const logout = () =>
  httpClient.post<ApiResponse<null>>('/auth/logout')

export const getMe = () =>
  httpClient.get<ApiResponse<AuthUser>>('/auth/me')
