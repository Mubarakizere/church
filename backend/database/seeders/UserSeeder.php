<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin account for Shyogwe Diocese IT
        // NOTE: Do NOT use Hash::make() here — the User model has a
        // 'password' => 'hashed' cast that auto-hashes on assignment.
        // Using Hash::make() would double-hash and break login.
        User::updateOrCreate(
            ['email' => 'it@earshyogwe.com'],
            [
                'name' => 'IT Administrator',
                'password' => 'josue@09',
            ]
        );
    }
}