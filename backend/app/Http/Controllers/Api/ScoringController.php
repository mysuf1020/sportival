<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Match;
use App\Models\MatchScore;
use App\Models\MedalStanding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoringController extends Controller
{
    public function getMatchScores(int $matchId): JsonResponse
    {
        $match = Match::with(['scores.judge', 'athlete1.athlete.contingent', 'athlete2.athlete.contingent'])
            ->findOrFail($matchId);

        $summary = $this->calculateScoreSummary($match);

        return response()->json(['success' => true, 'data' => ['match' => $match, 'summary' => $summary]]);
    }

    public function submitScore(Request $request, int $matchId): JsonResponse
    {
        $match = Match::findOrFail($matchId);
        $judge = $request->user();

        if (!$judge->isJuri()) {
            return response()->json(['success' => false, 'message' => 'Hanya juri yang bisa input nilai'], 403);
        }

        $data = $request->validate([
            'registration_id' => 'required|exists:registrations,id',
            'round_number' => 'required|integer|min:1|max:3',
            'score' => 'required|numeric|min:0|max:100',
            'penalties' => 'integer|min:0',
            'score_data' => 'nullable|array',
        ]);

        $score = MatchScore::updateOrCreate(
            [
                'match_id' => $matchId,
                'judge_id' => $judge->id,
                'registration_id' => $data['registration_id'],
                'round_number' => $data['round_number'],
            ],
            [
                'score' => $data['score'],
                'penalties' => $data['penalties'] ?? 0,
                'score_data' => $data['score_data'] ?? null,
            ]
        );

        $summary = $this->calculateScoreSummary($match->fresh());
        broadcast(new \App\Events\ScoreUpdated($matchId, $summary));

        return response()->json(['success' => true, 'message' => 'Nilai berhasil disimpan', 'data' => $score]);
    }

    public function finishMatch(Request $request, int $matchId): JsonResponse
    {
        $match = Match::with('scores')->findOrFail($matchId);
        $summary = $this->calculateScoreSummary($match);

        if (!$summary['winner_id']) {
            return response()->json(['success' => false, 'message' => 'Pemenang belum bisa ditentukan (skor sama)'], 422);
        }

        DB::transaction(function () use ($match, $summary) {
            $match->update([
                'winner_registration_id' => $summary['winner_id'],
                'status' => 'finished',
                'finished_at' => now(),
            ]);

            $this->updateMedalStandings($match, $summary['loser_id']);
        });

        broadcast(new \App\Events\MatchUpdated($match->fresh()->load('winner.athlete.contingent')));

        return response()->json(['success' => true, 'message' => 'Match selesai', 'data' => $match->fresh()]);
    }

    private function calculateScoreSummary(Match $match): array
    {
        $scores = $match->scores()->get()->groupBy('registration_id');
        $totals = [];

        foreach ($scores as $regId => $regScores) {
            $totalScore = $regScores->sum('score') - ($regScores->sum('penalties') * 2);
            $totals[$regId] = $totalScore;
        }

        $winner = null;
        $loser = null;

        if (count($totals) === 2) {
            arsort($totals);
            $ids = array_keys($totals);
            if ($totals[$ids[0]] !== $totals[$ids[1]]) {
                $winner = $ids[0];
                $loser = $ids[1];
            }
        }

        return [
            'totals' => $totals,
            'winner_id' => $winner,
            'loser_id' => $loser,
        ];
    }

    private function updateMedalStandings(Match $match, ?int $loserId): void
    {
        if (!$loserId) return;

        $loserReg = \App\Models\Registration::with('athlete.contingent')->find($loserId);
        if (!$loserReg) return;

        $eventId = $match->category->event_id;
        $contingentId = $loserReg->athlete->contingent_id;

        // Determine medal: final match = gold/silver, semi = bronze
        $bracket = $match->bracket;
        $maxRound = $bracket->matches()->max('round');

        $medal = match(true) {
            $match->round === $maxRound => 'silver',
            $match->round === $maxRound - 1 => 'bronze',
            default => null,
        };

        if ($medal) {
            MedalStanding::updateOrCreate(
                ['event_id' => $eventId, 'contingent_id' => $contingentId],
                [$medal => DB::raw($medal . ' + 1'), 'updated_at' => now()]
            );
        }

        // Winner's gold handled when final is finished
        if ($match->round === $maxRound) {
            $winnerReg = \App\Models\Registration::with('athlete.contingent')->find($match->winner_registration_id);
            if ($winnerReg) {
                MedalStanding::updateOrCreate(
                    ['event_id' => $eventId, 'contingent_id' => $winnerReg->athlete->contingent_id],
                    ['gold' => DB::raw('gold + 1'), 'updated_at' => now()]
                );
            }
        }

        $this->recalculateRanks($eventId);
    }

    private function recalculateRanks(int $eventId): void
    {
        $standings = MedalStanding::where('event_id', $eventId)
            ->orderByDesc('gold')
            ->orderByDesc('silver')
            ->orderByDesc('bronze')
            ->get();

        foreach ($standings as $rank => $standing) {
            $standing->update(['rank' => $rank + 1]);
        }
    }
}
