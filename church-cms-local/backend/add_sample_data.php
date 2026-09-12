<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ADDING SAMPLE DATA ===\n";

// Setup database connection
$capsule = new Capsule;

if ($_ENV['DB_CONNECTION'] === 'mysql') {
    $capsule->addConnection([
        'driver' => 'mysql',
        'host' => $_ENV['DB_HOST'],
        'port' => $_ENV['DB_PORT'] ?? 3306,
        'database' => $_ENV['DB_DATABASE'],
        'username' => $_ENV['DB_USERNAME'],
        'password' => $_ENV['DB_PASSWORD'],
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
    ]);
} else {
    $capsule->addConnection([
        'driver' => 'sqlite',
        'database' => $_ENV['DB_DATABASE'],
        'prefix' => '',
    ]);
}

$capsule->setAsGlobal();
$capsule->bootEloquent();

try {
    // Add sample events
    echo "Adding sample events...\n";
    
    $events = [
        [
            'title' => 'Sunday Morning Service',
            'description' => 'Join us for our weekly Sunday morning worship service with Holy Communion.',
            'date' => '2024-12-15',
            'time' => '09:00:00',
            'location' => 'Main Church',
            'status' => 'upcoming',
            'featured' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'title' => 'Christmas Carol Service',
            'description' => 'A beautiful evening of Christmas carols and celebration.',
            'date' => '2024-12-24',
            'time' => '19:00:00',
            'location' => 'Main Church',
            'status' => 'upcoming',
            'featured' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'title' => 'Youth Group Meeting',
            'description' => 'Weekly youth group meeting for teens and young adults.',
            'date' => '2024-12-20',
            'time' => '18:00:00',
            'location' => 'Youth Hall',
            'status' => 'upcoming',
            'featured' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ];
    
    foreach ($events as $event) {
        $capsule->table('events')->insert($event);
    }
    echo "✅ Added " . count($events) . " events\n";
    
    // Add sample team members
    echo "Adding sample team members...\n";
    
    $teamMembers = [
        [
            'name' => 'Rt. Rev. Nathan Gasatura',
            'title' => 'Bishop of Shyogwe Diocese',
            'category' => 'bishop',
            'description' => 'Leading the Anglican Church of Rwanda, Shyogwe Diocese with spiritual wisdom and pastoral care.',
            'email' => 'bishop@earshyogwe.com',
            'phone' => '+250 788 123 456',
            'is_active' => true,
            'display_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Rev. John Uwimana',
            'title' => 'Archdeacon of Gitarama',
            'category' => 'archdeacon',
            'description' => 'Serving the Gitarama region with dedication and faith.',
            'email' => 'archdeacon.gitarama@earshyogwe.com',
            'phone' => '+250 788 234 567',
            'region' => 'Gitarama',
            'is_active' => true,
            'display_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Rev. Mary Mukamana',
            'title' => 'Archdeacon of Muhanga',
            'category' => 'archdeacon',
            'description' => 'Dedicated to serving the community with faith and compassion.',
            'email' => 'archdeacon.muhanga@earshyogwe.com',
            'phone' => '+250 788 345 678',
            'region' => 'Muhanga',
            'is_active' => true,
            'display_order' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Mr. David Nkurunziza',
            'title' => 'Director of Education',
            'category' => 'department',
            'description' => 'Overseeing educational programs and institutions across the diocese.',
            'email' => 'education@earshyogwe.com',
            'phone' => '+250 788 456 789',
            'is_active' => true,
            'display_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Mrs. Grace Uwimana',
            'title' => 'Human Resources Manager',
            'category' => 'department',
            'description' => 'Managing human resources and staff development across the diocese.',
            'email' => 'hr@earshyogwe.com',
            'phone' => '+250 788 567 890',
            'is_active' => true,
            'display_order' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ];
    
    foreach ($teamMembers as $member) {
        $capsule->table('teams')->insert($member);
    }
    echo "✅ Added " . count($teamMembers) . " team members\n";
    
    echo "\n=== SAMPLE DATA ADDED SUCCESSFULLY ===\n";
    
} catch (Exception $e) {
    echo "❌ Error adding sample data: " . $e->getMessage() . "\n";
}

function now() {
    return date('Y-m-d H:i:s');
}
