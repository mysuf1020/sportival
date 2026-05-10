<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScoreUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $matchId,
        public array $summary
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('match.' . $this->matchId)];
    }

    public function broadcastAs(): string
    {
        return 'score.updated';
    }

    public function broadcastWith(): array
    {
        return ['match_id' => $this->matchId, 'summary' => $this->summary];
    }
}
