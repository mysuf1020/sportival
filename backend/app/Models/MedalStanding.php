<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedalStanding extends Model
{
    public $timestamps = false;

    // total_medals is a DB-generated column (storedAs), never mass-assigned
    protected $fillable = [
        'event_id', 'contingent_id', 'gold', 'silver', 'bronze', 'rank',
    ];

    protected function casts(): array
    {
        return [
            'gold' => 'integer',
            'silver' => 'integer',
            'bronze' => 'integer',
            'total_medals' => 'integer',
            'rank' => 'integer',
            'updated_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function contingent(): BelongsTo
    {
        return $this->belongsTo(Contingent::class);
    }
}
