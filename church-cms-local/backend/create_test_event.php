<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Database configuration
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => '127.0.0.1',
    'database'  => 'church',
    'username'  => 'root',
    'password' => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Create a test event
try {
    $event = Capsule::table('events')->insert([
        'title' => 'Test Event',
        'description' => 'This is a test event for debugging purposes',
        'date' => '2025-10-15',
        'time' => '10:00:00',
        'location' => 'Main Hall',
        'status' => 'upcoming',
        'attendees' => 'All Welcome',
        'featured' => true,
        'is_recurring' => false,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    
    echo "Test event created successfully!\n";
} catch (Exception $e) {
    echo "Error creating test event: " . $e->getMessage() . "\n";
}