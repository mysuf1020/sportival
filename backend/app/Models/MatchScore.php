<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchScore extends Model
{
    protected $fillable = [
        'match_id',
        'judge_id',
        'registration_id',
        'round_number',
        'score',
        'penalties',
        'score_data',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'float',
            'penalties' => 'integer',
            'score_data' => 'array',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(SportsMatch::class);
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judge_id');
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
