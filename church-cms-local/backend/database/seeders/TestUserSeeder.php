<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test admin user
        User::create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Create another test user
        User::create([
            'name' => 'Church Admin',
            'email' => 'admin@church.com',
            'password' => Hash::make('shyogwe2024'),
            'email_verified_at' => now(),
        ]);
    }
}