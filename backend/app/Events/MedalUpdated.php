<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MedalUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $eventId, public array $standings) {}

    public function broadcastOn(): array
    {
        return [new Channel('event.' . $this->eventId . '.medals')];
    }

    public function broadcastAs(): string
    {
        return 'medal.updated';
    }

    public function broadcastWith(): array
    {
        return ['event_id' => $this->eventId, 'standings' => $this->standings];
    }
}
