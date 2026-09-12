<?php
require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Hash;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $email = 'local_admin@example.com';
    $existing = App\Models\User::where('email', $email)->first();
    if ($existing) {
        echo "User already exists: {$existing->email}\n";
        exit(0);
    }

    $user = App\Models\User::create([
        'name' => 'Local Admin',
        'email' => $email,
        'password' => Hash::make('password123')
    ]);

    echo "Created user: {$user->email} with password password123\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
