<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Athlete extends Model
{
    protected $fillable = [
        'contingent_id', 'name', 'gender', 'birth_date',
        'weight', 'height', 'photo', 'id_number', 'status',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'weight' => 'float',
            'height' => 'float',
        ];
    }

    public function contingent(): BelongsTo
    {
        return $this->belongsTo(Contingent::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }
}
