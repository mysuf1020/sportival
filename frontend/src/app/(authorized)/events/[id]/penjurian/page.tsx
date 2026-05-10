'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, getBracket } from '@/lib/apis/event'
import { getMatchScores, submitScore, finishMatch } from '@/lib/apis/scoring'
import type { Category, Match } from '@/lib/types'

export default function PenjurianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const eventId = parseInt(id)
  const qc = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [scores, setScores] = useState<Record<number, { score: string; penalties: string }>>({})

  const { data: catData } = useQuery({
    queryKey: ['categories', eventId],
    queryFn: () => getCategories(eventId),
  })
  const categories: Category[] = catData?.data.data ?? []

  const { data: bracketData } = useQuery({
    queryKey: ['bracket', selectedCategory],
    queryFn: () => getBracket(eventId, selectedCategory!),
    enabled: !!selectedCategory,
  })

  const matches = (bracketData?.data.data?.matches ?? []).filter(
    (m: Match) => m.status !== 'bye' && m.registration1_id && m.registration2_id
  )

  const { data: scoreData } = useQuery({
    queryKey: ['scores', selectedMatch?.id],
    queryFn: () => getMatchScores(selectedMatch!.id),
    enabled: !!selectedMatch,
    refetchInterval: 5000,
  })

  const scoreMutation = useMutation({
    mutationFn: ({ regId, score, penalties }: { regId: number; score: number; penalties: number }) =>
      submitScore(selectedMatch!.id, { registration_id: regId, round_number: 1, score, penalties }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scores', selectedMatch?.id] }),
  })

  const finishMutation = useMutation({
    mutationFn: () => finishMatch(selectedMatch!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scores', selectedMatch?.id] })
      qc.invalidateQueries({ queryKey: ['bracket', selectedCategory] })
      setSelectedMatch(null)
    },
  })

  function handleSubmitScore(regId: number) {
    const s = scores[regId]
    if (!s) return
    scoreMutation.mutate({
      regId,
      score: parseFloat(s.score) || 0,
      penalties: parseInt(s.penalties) || 0,
    })
  }

  const summary = scoreData?.data.data?.summary

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Link href={`/events/${id}`} className="text-sm text-blue-600 hover:underline">← Event</Link>
        <h1 className="text-xl font-bold text-gray-900">Panel Penjurian</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <select
              value={selectedCategory ?? ''}
              onChange={(e) => { setSelectedCategory(e.target.value ? parseInt(e.target.value) : null); setSelectedMatch(null) }}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {matches.length > 0 && (
            <div className="rounded-xl bg-white shadow-sm">
              <p className="border-b px-4 py-3 text-sm font-semibold text-gray-700">Pilih Match</p>
              <div className="divide-y">
                {matches.map((match: Match) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 ${selectedMatch?.id === match.id ? 'bg-blue-50' : ''}`}
                  >
                    <p className="font-medium">Match #{match.match_number} - Ronde {match.round}</p>
                    <p className="text-xs text-gray-500">
                      {match.athlete1?.athlete?.name} vs {match.athlete2?.athlete?.name}
                    </p>
                    <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-xs ${
                      match.status === 'finished' ? 'bg-green-100 text-green-700' :
                      match.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>{match.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedMatch ? (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Match #{selectedMatch.match_number}</h2>
                {summary && (
                  <button
                    onClick={() => finishMutation.mutate()}
                    disabled={!summary.winner_id || finishMutation.isPending}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {finishMutation.isPending ? 'Memproses...' : 'Selesaikan Match'}
                  </button>
                )}
              </div>

              {(() => {
                const activeCat = categories.find((c) => c.id === selectedCategory)
                const scoringType = activeCat?.scoring_type ?? 'points'
                const SCORING_HINT: Record<string, string> = {
                  points:     'Sistem Penilaian: Poin (0–100, lebih besar menang)',
                  time_asc:   'Sistem Penilaian: Waktu (input dalam detik, lebih kecil menang)',
                  rounds_won: 'Sistem Penilaian: Ronde Dimenangkan',
                }
                return (
                  <div className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                    {SCORING_HINT[scoringType]}
                  </div>
                )
              })()}

              <div className="grid grid-cols-2 gap-4">
                {[
                  { reg: selectedMatch.athlete1, regId: selectedMatch.registration1_id },
                  { reg: selectedMatch.athlete2, regId: selectedMatch.registration2_id },
                ].map(({ reg, regId }) => {
                  if (!reg || !regId) return null
                  const total = summary?.totals?.[regId]
                  const isWinner = summary?.winner_id === regId
                  const activeCat = categories.find((c) => c.id === selectedCategory)
                  const scorePlaceholder = activeCat?.scoring_type === 'time_asc' ? 'Waktu (detik)' : activeCat?.scoring_type === 'rounds_won' ? 'Ronde Menang' : 'Nilai (0-100)'
                  return (
                    <div key={regId} className={`rounded-lg border p-4 ${isWinner ? 'border-green-400 bg-green-50' : ''}`}>
                      <p className="font-semibold text-gray-900">{reg.athlete?.name}</p>
                      <p className="text-xs text-gray-500">{reg.athlete?.contingent?.name}</p>
                      {total !== undefined && (
                        <p className="mt-2 text-2xl font-bold text-blue-700">{total.toFixed(1)}</p>
                      )}
                      <div className="mt-3 space-y-2">
                        <input
                          type="number"
                          step="0.1"
                          placeholder={scorePlaceholder}
                          value={scores[regId]?.score ?? ''}
                          onChange={(e) => setScores((s) => ({ ...s, [regId]: { ...s[regId], score: e.target.value } }))}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Penalti"
                          value={scores[regId]?.penalties ?? ''}
                          onChange={(e) => setScores((s) => ({ ...s, [regId]: { ...s[regId], penalties: e.target.value } }))}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSubmitScore(regId)}
                          disabled={scoreMutation.isPending}
                          className="w-full rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Submit Nilai
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
              Pilih match untuk input nilai
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
