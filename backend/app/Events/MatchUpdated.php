<?php

namespace App\Events;

use App\Models\TournamentMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public TournamentMatch $match) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('category.' . $this->match->category_id),
            new Channel('bracket.' . $this->match->bracket_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'match.updated';
    }

    public function broadcastWith(): array
    {
        return ['match' => $this->match];
    }
}
