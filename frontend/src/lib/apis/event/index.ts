import httpClient from '@/lib/http-request'
import type { ApiResponse, Bracket, Category, Event, EventStats, Match, MedalStanding, Registration } from '@/lib/types'

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

export const getEventSchedule = (eventId: number) =>
  httpClient.get<ApiResponse<Match[]>>(`/events/${eventId}/schedule`)

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

export const updateMatchSchedule = (matchId: number, data: { court?: string; scheduled_at?: string | null }) =>
  httpClient.patch<ApiResponse<Match>>(`/admin/matches/${matchId}/schedule`, data)

export const getEventStats = (eventId: number) =>
  httpClient.get<ApiResponse<EventStats>>(`/admin/events/${eventId}/stats`)

export const sendScheduleNotification = (eventId: number) =>
  httpClient.post<ApiResponse<{ sent: number; failed: number; skipped: number }>>(`/admin/events/${eventId}/notify/schedule`)

export const createEvent = (data: unknown) =>
  httpClient.post<ApiResponse<Event>>('/admin/events', data)

export const updateEvent = (id: number, data: unknown) =>
  httpClient.put<ApiResponse<Event>>(`/admin/events/${id}`, data)

export const downloadExport = async (
  eventId: number,
  type: 'participants' | 'medals' | 'certificates/winners' | 'certificates/participants',
  filename: string,
): Promise<void> => {
  const response = await httpClient.get(`/admin/events/${eventId}/export/${type}`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
