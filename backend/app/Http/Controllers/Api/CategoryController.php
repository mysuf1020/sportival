<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(int $eventId): JsonResponse
    {
        $categories = Category::where('event_id', $eventId)
            ->withCount('registrations')
            ->get();

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request, int $eventId): JsonResponse
    {
        Event::findOrFail($eventId);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female,mixed',
            'age_min' => 'nullable|integer|min:5',
            'age_max' => 'nullable|integer|min:5',
            'weight_min' => 'nullable|numeric|min:0',
            'weight_max' => 'nullable|numeric|min:0',
            'competition_type' => 'required|in:single_elimination,double_elimination,round_robin',
            'sport_discipline' => 'nullable|string|max:100',
            'max_participants' => 'nullable|integer|min:2',
        ]);

        $data['event_id'] = $eventId;
        $data['slug'] = Str::slug($data['name']);

        $category = Category::create($data);

        return response()->json(['success' => true, 'message' => 'Kategori berhasil dibuat', 'data' => $category], 201);
    }

    public function update(Request $request, int $eventId, int $id): JsonResponse
    {
        $category = Category::where('event_id', $eventId)->findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'gender' => 'sometimes|in:male,female,mixed',
            'age_min' => 'nullable|integer',
            'age_max' => 'nullable|integer',
            'weight_min' => 'nullable|numeric',
            'weight_max' => 'nullable|numeric',
            'competition_type' => 'sometimes|in:single_elimination,double_elimination,round_robin',
            'sport_discipline' => 'nullable|string',
            'max_participants' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return response()->json(['success' => true, 'message' => 'Kategori berhasil diupdate', 'data' => $category]);
    }

    public function destroy(int $eventId, int $id): JsonResponse
    {
        Category::where('event_id', $eventId)->findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Kategori berhasil dihapus', 'data' => null]);
    }
}
