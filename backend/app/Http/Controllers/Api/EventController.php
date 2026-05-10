<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::orderByDesc('event_start')->get();

        return response()->json(['success' => true, 'data' => $events]);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        return response()->json(['success' => true, 'data' => $event]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sport_type' => 'required|string|max:100',
            'description' => 'nullable|string',
            'location' => 'required|string',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'registration_start' => 'required|date',
            'registration_end' => 'required|date|after_or_equal:registration_start',
            'event_start' => 'required|date',
            'event_end' => 'required|date|after_or_equal:event_start',
            'status' => 'in:draft,registration_open,registration_closed,ongoing,finished',
            'settings' => 'nullable|array',
        ]);

        $data['slug'] = Str::slug($data['name']) . '-' . now()->year;

        $event = Event::create($data);

        return response()->json(['success' => true, 'message' => 'Event berhasil dibuat', 'data' => $event], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sport_type' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'location' => 'sometimes|string',
            'city' => 'sometimes|string|max:100',
            'province' => 'sometimes|string|max:100',
            'registration_start' => 'sometimes|date',
            'registration_end' => 'sometimes|date',
            'event_start' => 'sometimes|date',
            'event_end' => 'sometimes|date',
            'status' => 'sometimes|in:draft,registration_open,registration_closed,ongoing,finished',
            'settings' => 'nullable|array',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . now()->year;
        }

        $event->update($data);

        return response()->json(['success' => true, 'message' => 'Event berhasil diupdate', 'data' => $event]);
    }

    public function destroy(int $id): JsonResponse
    {
        Event::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Event berhasil dihapus', 'data' => null]);
    }
}
