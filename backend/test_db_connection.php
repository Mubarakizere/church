<?php
// Test database connection
require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

echo "Database connection test:\n";

try {
    $app = require_once 'bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    DB::connection()->getPdo();
    echo "Connected successfully\n";
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?>
<?php

// Load the .env file
$env = parse_ini_file('.env');

// Database configuration
$host = $env['DB_HOST'];
$port = $env['DB_PORT'];
$dbname = $env['DB_DATABASE'];
$username = $env['DB_USERNAME'];
$password = $env['DB_PASSWORD'];

try {
    // Create a PDO connection
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "Database connection successful!\n";
    
    // Check if events table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'events'");
    $tableExists = $stmt->fetch();
    
    if ($tableExists) {
        echo "Events table exists.\n";
        
        // Check table structure
        $stmt = $pdo->query("DESCRIBE events");
        $columns = $stmt->fetchAll();
        
        echo "Events table structure:\n";
        foreach ($columns as $column) {
            echo "- {$column['Field']} ({$column['Type']})\n";
        }
        
        // Check if there are any events
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM events");
        $count = $stmt->fetch()['count'];
        echo "Number of events in table: $count\n";
        
        if ($count > 0) {
            echo "Sample events:\n";
            $stmt = $pdo->query("SELECT * FROM events LIMIT 3");
            $events = $stmt->fetchAll();
            foreach ($events as $event) {
                print_r($event);
            }
        }
    } else {
        echo "Events table does not exist.\n";
    }
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
}