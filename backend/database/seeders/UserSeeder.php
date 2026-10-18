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
        // Ensure 'id' column on 'users' has AUTO_INCREMENT and PRIMARY KEY in case migrations weren't run yet
        try {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE `users` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT");
        } catch (\Throwable $e1) {
            try {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE `users` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (`id`)");
            } catch (\Throwable $e2) {
                // Table might already be configured properly
            }
        }

        // Admin account for Shyogwe Diocese IT
        // NOTE: Do NOT use Hash::make() here — the User model has a
        // 'password' => 'hashed' cast that auto-hashes on assignment.
        $user = User::where('email', 'it@earshyogwe.com')->first();

        if (!$user) {
            $user = new User();
            $user->email = 'it@earshyogwe.com';
            $user->name = 'IT Administrator';
            $user->password = 'josue@09';

            // Fallback: If table still lacks auto-increment for any reason, explicitly assign next ID
            $maxId = (int) User::max('id');
            $user->id = $maxId > 0 ? $maxId + 1 : 1;
            $user->save();
        } else {
            $user->name = 'IT Administrator';
            $user->password = 'josue@09';
            $user->save();
        }
    }
}