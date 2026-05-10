<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\MedalStanding;
use App\Models\Registration;
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
}
