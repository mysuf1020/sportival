<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Contingent extends Model
{
    protected $fillable = [
        'event_id', 'name', 'region', 'province',
        'contact_person', 'phone', 'email', 'logo', 'status',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function athletes(): HasMany
    {
        return $this->hasMany(Athlete::class);
    }

    public function medalStanding(): HasOne
    {
        return $this->hasOne(MedalStanding::class);
    }
}
