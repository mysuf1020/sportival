import httpClient from '@/lib/http-request'
import type { ApiResponse, Bracket, Category, Event, MedalStanding, Registration } from '@/lib/types'

export const getEvents = () =>
  httpClient.get<ApiResponse<Event[]>>('/events')

export const getEvent = (slug: string) =>
  httpClient.get<ApiResponse<Event>>(`/events/${slug}`)

export const getCategories = (eventId: number) =>
  httpClient.get<ApiResponse<Category[]>>(`/events/${eventId}/categories`)

export const getMedals = (eventId: number) =>
  httpClient.get<ApiResponse<MedalStanding[]>>(`/events/${eventId}/medals`)

export const getBracket = (eventId: number, categoryId: number) =>
  httpClient.get<ApiResponse<Bracket>>(`/events/${eventId}/bracket/${categoryId}`)

export const checkRegistration = (eventId: number, contingentName: string) =>
  httpClient.get<ApiResponse<unknown>>(`/events/${eventId}/check`, { params: { contingent_name: contingentName } })

export const submitRegistration = (eventId: number, data: unknown) =>
  httpClient.post<ApiResponse<unknown>>(`/events/${eventId}/register`, data)

// Admin
export const getRegistrations = (eventId: number, params?: Record<string, unknown>) =>
  httpClient.get<ApiResponse<Registration[]>>(`/admin/events/${eventId}/registrations`, { params })

export const verifyRegistration = (id: number, data: { status: 'verified' | 'rejected'; notes?: string; seeding?: number }) =>
  httpClient.patch<ApiResponse<Registration>>(`/admin/registrations/${id}/verify`, data)

export const generateBracket = (categoryId: number) =>
  httpClient.post<ApiResponse<Bracket>>(`/admin/categories/${categoryId}/bracket/generate`)

export const createEvent = (data: unknown) =>
  httpClient.post<ApiResponse<Event>>('/admin/events', data)

export const updateEvent = (id: number, data: unknown) =>
  httpClient.put<ApiResponse<Event>>(`/admin/events/${id}`, data)
