<?php

try {
    // Database connection parameters
    $host = '127.0.0.1';
    $port = '3306';
    $username = 'root';
    $password = '';
    $database = 'church_cms';

    // Connect to MySQL server (without specifying database)
    $pdo = new PDO("mysql:host=$host;port=$port", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Drop database if it exists and recreate it
    $sql = "DROP DATABASE IF EXISTS `$database`";
    $pdo->exec($sql);
    echo "Database '$database' dropped if it existed.\n";

    $sql = "CREATE DATABASE `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    $pdo->exec($sql);
    echo "Database '$database' created successfully.\n";

    // Test connection to the new database
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database", $username, $password);
    echo "Successfully connected to database '$database'.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
