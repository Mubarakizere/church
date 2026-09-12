<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Check if admin user exists
    $user = App\Models\User::where('email', 'admin@shyogwe.org')->first();
    
    if ($user) {
        echo "Admin user already exists: " . $user->email . "\n";
        
        // Update password to ensure it's correct
        $user->password = Hash::make('shyogwe2024');
        $user->save();
        echo "Password updated for admin user.\n";
    } else {
        // Create admin user
        $user = App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@shyogwe.org',
            'password' => Hash::make('shyogwe2024'),
        ]);
        echo "Admin user created: " . $user->email . "\n";
    }
    
    echo "\nAdmin Login Credentials:\n";
    echo "Email: admin@shyogwe.org\n";
    echo "Password: shyogwe2024\n";
    echo "URL: http://localhost:8081/admin/login\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
