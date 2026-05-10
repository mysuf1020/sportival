<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Registration extends Model
{
    protected $fillable = [
        'athlete_id', 'category_id', 'registration_number',
        'status', 'verified_by', 'verified_at', 'notes', 'seeding',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'seeding' => 'integer',
        ];
    }

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(MatchScore::class);
    }
}
