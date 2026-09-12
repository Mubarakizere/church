<?php
require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Hash;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $admin = App\Models\User::where('name', 'Admin')->first();
    if (!$admin) {
        echo "Admin user not found.\n";
        exit(1);
    }

    $admin->email = 'admin@shyogwe.org';
    $admin->password = Hash::make('shyogwe2024');
    $admin->save();

    echo "Updated Admin user: {$admin->email}\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
