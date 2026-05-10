<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bracket extends Model
{
    protected $fillable = ['category_id', 'format', 'status', 'bracket_data'];

    protected function casts(): array
    {
        return ['bracket_data' => 'array'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function matches(): HasMany
    {
        return $this->hasMany(Match::class);
    }
}
