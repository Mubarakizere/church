<?php
require_once 'vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $users = App\Models\User::all(['id','email','name']);
    echo "Users in DB:\n";
    foreach ($users as $user) {
        echo "- ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
