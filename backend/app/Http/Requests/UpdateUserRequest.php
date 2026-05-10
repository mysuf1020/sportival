<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:50|alpha_dash|unique:users,username,' . $userId,
            'email' => 'nullable|email|unique:users,email,' . $userId,
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|string|in:super_admin,admin,sekretariat,bendahara,ketua_juri,juri',
            'event_id' => 'nullable|integer|exists:events,id',
            'is_active' => 'boolean',
        ];
    }
}
