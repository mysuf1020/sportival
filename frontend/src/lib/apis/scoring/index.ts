import httpClient from '@/lib/http-request'
import type { ApiResponse, Match, MatchScore } from '@/lib/types'

export const getMatchScores = (matchId: number) =>
  httpClient.get<ApiResponse<{ match: Match; summary: { totals: Record<number, number>; winner_id: number | null } }>>(`/admin/matches/${matchId}/scores`)

export const submitScore = (matchId: number, data: {
  registration_id: number
  round_number: number
  score: number
  penalties?: number
  score_data?: Record<string, unknown>
}) =>
  httpClient.post<ApiResponse<MatchScore>>(`/admin/matches/${matchId}/scores`, data)

export const finishMatch = (matchId: number) =>
  httpClient.post<ApiResponse<Match>>(`/admin/matches/${matchId}/finish`)

export const updateMatch = (matchId: number, data: {
  court?: string
  scheduled_at?: string
  status?: string
  winner_registration_id?: number
}) =>
  httpClient.patch<ApiResponse<Match>>(`/admin/matches/${matchId}`, data)
