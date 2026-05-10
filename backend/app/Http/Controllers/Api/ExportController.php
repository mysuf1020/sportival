<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\MedalStanding;
use App\Models\Registration;
use App\Models\TournamentMatch;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function exportParticipants(int $eventId): mixed
    {
        $event = Event::findOrFail($eventId);

        $registrations = Registration::with(['athlete.contingent', 'category'])
            ->whereHas('category', fn($q) => $q->where('event_id', $eventId))
            ->where('status', 'verified')
            ->orderBy('category_id')
            ->orderBy('id')
            ->get();

        $pdf = Pdf::loadView('exports.participants', compact('event', 'registrations'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download("peserta-{$event->slug}.pdf");
    }

    public function exportMedals(int $eventId): mixed
    {
        $event = Event::findOrFail($eventId);

        $standings = MedalStanding::with('contingent')
            ->where('event_id', $eventId)
            ->orderBy('rank')
            ->get();

        $pdf = Pdf::loadView('exports.medals', compact('event', 'standings'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download("medali-{$event->slug}.pdf");
    }

    public function exportWinnerCertificates(int $eventId): mixed
    {
        $event = Event::findOrFail($eventId);

        // Get last round per bracket to determine gold/silver/bronze
        $finishedMatches = TournamentMatch::with(['athlete1.athlete.contingent', 'athlete2.athlete.contingent', 'category:id,name'])
            ->whereHas('category', fn($q) => $q->where('event_id', $eventId))
            ->where('status', 'finished')
            ->whereNotNull('winner_registration_id')
            ->get();

        $winners = [];
        foreach ($finishedMatches as $match) {
            $maxRound = TournamentMatch::where('bracket_id', $match->bracket_id)->max('round');

            if ($match->round === $maxRound) {
                // Final: winner = gold, loser = silver
                $winnerId = $match->winner_registration_id;
                $loserId  = $winnerId === $match->registration1_id ? $match->registration2_id : $match->registration1_id;

                $winnerReg = $winnerId === $match->registration1_id ? $match->athlete1 : $match->athlete2;
                $loserReg  = $loserId === $match->registration1_id ? $match->athlete1 : $match->athlete2;

                if ($winnerReg?->athlete) {
                    $winners[] = ['medal' => 'gold', 'athlete_name' => $winnerReg->athlete->name, 'contingent_name' => $winnerReg->athlete->contingent?->name ?? '', 'category_name' => $match->category?->name ?? ''];
                }
                if ($loserReg?->athlete) {
                    $winners[] = ['medal' => 'silver', 'athlete_name' => $loserReg->athlete->name, 'contingent_name' => $loserReg->athlete->contingent?->name ?? '', 'category_name' => $match->category?->name ?? ''];
                }
            } elseif ($match->round === $maxRound - 1) {
                // Semi final losers = bronze
                $loserId = $match->winner_registration_id === $match->registration1_id ? $match->registration2_id : $match->registration1_id;
                $loserReg = $loserId === $match->registration1_id ? $match->athlete1 : $match->athlete2;
                if ($loserReg?->athlete) {
                    $winners[] = ['medal' => 'bronze', 'athlete_name' => $loserReg->athlete->name, 'contingent_name' => $loserReg->athlete->contingent?->name ?? '', 'category_name' => $match->category?->name ?? ''];
                }
            }
        }

        $pdf = Pdf::loadView('exports.certificate_winner', compact('event', 'winners'));
        $pdf->setPaper('a4', 'landscape');

        return $pdf->download("sertifikat-juara-{$event->slug}.pdf");
    }

    public function exportParticipantCertificates(int $eventId): mixed
    {
        $event = Event::findOrFail($eventId);

        $registrations = Registration::with(['athlete.contingent', 'category'])
            ->whereHas('category', fn($q) => $q->where('event_id', $eventId))
            ->where('status', 'verified')
            ->orderBy('category_id')
            ->orderBy('id')
            ->get();

        $pdf = Pdf::loadView('exports.certificate_participant', compact('event', 'registrations'));
        $pdf->setPaper('a4', 'landscape');

        return $pdf->download("sertifikat-peserta-{$event->slug}.pdf");
    }
}
