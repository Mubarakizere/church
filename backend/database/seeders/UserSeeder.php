<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@shyogwe.org'],
            [
                'name' => 'Diocesan Administrator',
                'password' => Hash::make('Admin@Shyogwe2026'),
            ]
        );
    }
}