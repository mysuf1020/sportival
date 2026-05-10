<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['username' => 'superadmin'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@sportival.id',
                'password' => Hash::make('sportival2024'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );
    }
}
