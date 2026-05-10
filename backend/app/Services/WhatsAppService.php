<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $token;
    private string $baseUrl = 'https://api.fonnte.com';

    public function __construct()
    {
        $this->token = config('services.fonnte.token', '');
    }

    public function send(string $phone, string $message): bool
    {
        if (empty($this->token)) {
            Log::warning('WhatsApp: FONNTE_TOKEN not configured');
            return false;
        }

        $normalized = $this->normalizePhone($phone);

        try {
            $response = Http::withToken($this->token)
                ->timeout(10)
                ->post("{$this->baseUrl}/send", [
                    'target'      => $normalized,
                    'message'     => $message,
                    'countryCode' => '62',
                ]);

            return $response->successful() && ($response->json('status') === true || $response->json('status') === 'true');
        } catch (\Exception $e) {
            Log::error('WhatsApp send failed', ['phone' => $normalized, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            return '62' . substr($phone, 1);
        }
        return $phone;
    }
}
