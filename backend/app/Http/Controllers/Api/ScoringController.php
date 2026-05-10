<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedalStanding;
use App\Models\MatchScore;
use App\Models\Registration;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoringController extends Controller
{
    public function getMatchScores(int $matchId): JsonResponse
    {
        $match = TournamentMatch::with([
            'scores.judge',
            'athlete1.athlete.contingent',
            'athlete2.athlete.contingent',
        ])->findOrFail($matchId);

        $summary = $this->calculateScoreSummary($match);

        return response()->json(['success' => true, 'data' => ['match' => $match, 'summary' => $summary]]);
    }

    public function submitScore(Request $request, int $matchId): JsonResponse
    {
        $match = TournamentMatch::findOrFail($matchId);
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

        $match->load('scores');
        $summary = $this->calculateScoreSummary($match);

        try {
            broadcast(new \App\Events\ScoreUpdated($matchId, $summary));
        } catch (\Exception) {}

        return response()->json(['success' => true, 'message' => 'Nilai berhasil disimpan', 'data' => $score]);
    }

    public function finishMatch(Request $request, int $matchId): JsonResponse
    {
        $match = TournamentMatch::with(['scores', 'bracket', 'category'])->findOrFail($matchId);
        $summary = $this->calculateScoreSummary($match);

        if (!$summary['winner_id']) {
            return response()->json([
                'success' => false,
                'message' => 'Pemenang belum bisa ditentukan. Skor masih sama atau belum ada nilai.',
            ], 422);
        }

        DB::transaction(function () use ($match, $summary) {
            $match->update([
                'winner_registration_id' => $summary['winner_id'],
                'status' => 'finished',
                'finished_at' => now(),
            ]);

            $this->updateMedalStandings($match, (int) $summary['loser_id']);
        });

        try {
            broadcast(new \App\Events\MatchUpdated($match->fresh()->load('winner.athlete.contingent')));
        } catch (\Exception) {}

        return response()->json(['success' => true, 'message' => 'Match selesai', 'data' => $match->fresh()]);
    }

    private function calculateScoreSummary(TournamentMatch $match): array
    {
        // Use loaded relation if available, otherwise query
        $scores = $match->relationLoaded('scores')
            ? $match->scores
            : $match->scores()->get();

        $totals = [];
        foreach ($scores->groupBy('registration_id') as $regId => $regScores) {
            $totals[$regId] = $regScores->sum('score') - ($regScores->sum('penalties') * 2);
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

    private function updateMedalStandings(TournamentMatch $match, int $loserId): void
    {
        $loserReg = Registration::with('athlete')->find($loserId);
        if (!$loserReg) return;

        // Lazy load relations if not already loaded
        if (!$match->relationLoaded('bracket')) $match->load('bracket');
        if (!$match->relationLoaded('category')) $match->load('category');

        $eventId = $match->category->event_id;
        $maxRound = $match->bracket->matches()->max('round');

        $loserMedal = match(true) {
            $match->round === $maxRound => 'silver',
            $match->round === $maxRound - 1 => 'bronze',
            default => null,
        };

        if ($loserMedal) {
            $loserStanding = MedalStanding::firstOrCreate(
                ['event_id' => $eventId, 'contingent_id' => $loserReg->athlete->contingent_id],
                ['gold' => 0, 'silver' => 0, 'bronze' => 0]
            );
            $loserStanding->increment($loserMedal);
            MedalStanding::where('id', $loserStanding->id)->update(['updated_at' => now()]);
        }

        // Gold for winner (only on final)
        if ($match->round === $maxRound && $match->winner_registration_id) {
            $winnerReg = Registration::with('athlete')->find($match->winner_registration_id);
            if ($winnerReg) {
                $winnerStanding = MedalStanding::firstOrCreate(
                    ['event_id' => $eventId, 'contingent_id' => $winnerReg->athlete->contingent_id],
                    ['gold' => 0, 'silver' => 0, 'bronze' => 0]
                );
                $winnerStanding->increment('gold');
                MedalStanding::where('id', $winnerStanding->id)->update(['updated_at' => now()]);
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
            MedalStanding::where('id', $standing->id)->update(['rank' => $rank + 1]);
        }
    }
}
