<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username|alpha_dash',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|in:super_admin,admin,sekretariat,bendahara,ketua_juri,juri',
            'event_id' => 'nullable|integer|exists:events,id',
            'is_active' => 'boolean',
        ];
    }
}
