<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TournamentMatch extends Model
{
    protected $table = 'matches';

    protected $fillable = [
        'bracket_id', 'category_id', 'round', 'match_number',
        'registration1_id', 'registration2_id', 'winner_registration_id',
        'court', 'scheduled_at', 'started_at', 'finished_at', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function bracket(): BelongsTo
    {
        return $this->belongsTo(Bracket::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function athlete1(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration1_id');
    }

    public function athlete2(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration2_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'winner_registration_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(MatchScore::class, 'match_id');
    }
}
