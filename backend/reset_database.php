<?php

try {
    // Database connection parameters
    $host = '127.0.0.1';
    $port = '3306';
    $username = 'root';
    $password = '';
    $database = 'church';

    // Connect to the database
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to database '$database'.\n";

    // Disable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    // Get all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Found " . count($tables) . " tables to drop.\n";

    // Drop all tables
    foreach ($tables as $table) {
        $pdo->exec("DROP TABLE IF EXISTS `$table`");
        echo "Dropped table: $table\n";
    }

    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "\nAll tables dropped successfully!\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
