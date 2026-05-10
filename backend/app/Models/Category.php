<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Category extends Model
{
    protected $fillable = [
        'event_id', 'name', 'slug', 'gender', 'age_min', 'age_max',
        'weight_min', 'weight_max', 'competition_type', 'scoring_type',
        'sport_discipline', 'max_participants', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'age_min' => 'integer',
            'age_max' => 'integer',
            'weight_min' => 'float',
            'weight_max' => 'float',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function bracket(): HasOne
    {
        return $this->hasOne(Bracket::class);
    }
}
