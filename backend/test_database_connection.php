<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Support\Facades\DB;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== DATABASE CONNECTION TEST ===\n";
echo "Environment: " . ($_ENV['APP_ENV'] ?? 'not set') . "\n";
echo "Database Connection: " . ($_ENV['DB_CONNECTION'] ?? 'not set') . "\n";
echo "Database Host: " . ($_ENV['DB_HOST'] ?? 'not set') . "\n";
echo "Database Name: " . ($_ENV['DB_DATABASE'] ?? 'not set') . "\n";
echo "Database Username: " . ($_ENV['DB_USERNAME'] ?? 'not set') . "\n";
echo "Database Password: " . (empty($_ENV['DB_PASSWORD']) ? 'empty' : 'set') . "\n";

// Test database connection
try {
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
    
    // Test connection
    $pdo = $capsule->getConnection()->getPdo();
    echo "\n✅ Database connection successful!\n";
    
    // Test if tables exist
    $tables = ['events', 'teams', 'users', 'health_centers', 'health_posts', 'schools', 'programs'];
    
    echo "\n=== TABLE CHECK ===\n";
    foreach ($tables as $table) {
        try {
            $count = $capsule->table($table)->count();
            echo "✅ Table '$table' exists with $count records\n";
        } catch (Exception $e) {
            echo "❌ Table '$table' error: " . $e->getMessage() . "\n";
        }
    }
    
    // Test specific queries that are failing
    echo "\n=== API ENDPOINT TESTS ===\n";
    
    // Test events query
    try {
        $events = $capsule->table('events')->where('is_active', true)->get();
        echo "✅ Events query successful: " . count($events) . " active events\n";
    } catch (Exception $e) {
        echo "❌ Events query failed: " . $e->getMessage() . "\n";
    }
    
    // Test teams query
    try {
        $teams = $capsule->table('teams')->where('is_active', true)->get();
        echo "✅ Teams query successful: " . count($teams) . " active team members\n";
    } catch (Exception $e) {
        echo "❌ Teams query failed: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "\n❌ Database connection failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
    
    if (strpos($e->getMessage(), 'Access denied') !== false) {
        echo "\n🔧 SOLUTION: Check your database credentials (username/password)\n";
    } elseif (strpos($e->getMessage(), 'Connection refused') !== false) {
        echo "\n🔧 SOLUTION: Check if your database server is running and accessible\n";
    } elseif (strpos($e->getMessage(), 'Unknown database') !== false) {
        echo "\n🔧 SOLUTION: Check if your database name is correct\n";
    } elseif (strpos($e->getMessage(), 'No such file') !== false) {
        echo "\n🔧 SOLUTION: SQLite database file not found\n";
    }
}

echo "\n=== END TEST ===\n";
