<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'name', 'slug', 'sport_type', 'description', 'logo', 'banner',
        'location', 'city', 'province',
        'registration_start', 'registration_end', 'event_start', 'event_end',
        'status', 'settings',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'registration_start' => 'date',
            'registration_end' => 'date',
            'event_start' => 'date',
            'event_end' => 'date',
        ];
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function contingents(): HasMany
    {
        return $this->hasMany(Contingent::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function medalStandings(): HasMany
    {
        return $this->hasMany(MedalStanding::class);
    }

    public function isRegistrationOpen(): bool
    {
        return $this->status === 'registration_open'
            && now()->between($this->registration_start, $this->registration_end);
    }
}
