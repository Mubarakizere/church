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

    // Create all necessary tables
    $tables = [
        // Users table
        "CREATE TABLE IF NOT EXISTS `users` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `email_verified_at` timestamp NULL DEFAULT NULL,
            `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `users_email_unique` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Sessions table
        "CREATE TABLE IF NOT EXISTS `sessions` (
            `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `user_id` bigint(20) unsigned DEFAULT NULL,
            `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `user_agent` text COLLATE utf8mb4_unicode_ci,
            `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
            `last_activity` int(11) NOT NULL,
            PRIMARY KEY (`id`),
            KEY `sessions_user_id_index` (`user_id`),
            KEY `sessions_last_activity_index` (`last_activity`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Cache table
        "CREATE TABLE IF NOT EXISTS `cache` (
            `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
            `expiration` int(11) NOT NULL,
            PRIMARY KEY (`key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Teams table
        "CREATE TABLE IF NOT EXISTS `teams` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `bio` text COLLATE utf8mb4_unicode_ci,
            `description` text COLLATE utf8mb4_unicode_ci,
            `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `social_media` json DEFAULT NULL,
            `is_active` tinyint(1) NOT NULL DEFAULT '1',
            `display_order` int(11) NOT NULL DEFAULT '0',
            `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'department',
            `department_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `teams_category_index` (`category`),
            KEY `teams_display_order_index` (`display_order`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Events table
        "CREATE TABLE IF NOT EXISTS `events` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `description` text COLLATE utf8mb4_unicode_ci,
            `content` longtext COLLATE utf8mb4_unicode_ci,
            `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `start_date` datetime NOT NULL,
            `end_date` datetime DEFAULT NULL,
            `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `is_featured` tinyint(1) NOT NULL DEFAULT '0',
            `is_published` tinyint(1) NOT NULL DEFAULT '1',
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `events_slug_unique` (`slug`),
            KEY `events_start_date_index` (`start_date`),
            KEY `events_is_featured_index` (`is_featured`),
            KEY `events_is_published_index` (`is_published`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Health Centers table
        "CREATE TABLE IF NOT EXISTS `health_centers` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `description` text COLLATE utf8mb4_unicode_ci,
            `services` json DEFAULT NULL,
            `contact_info` json DEFAULT NULL,
            `is_active` tinyint(1) NOT NULL DEFAULT '1',
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Health Posts table
        "CREATE TABLE IF NOT EXISTS `health_posts` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `description` text COLLATE utf8mb4_unicode_ci,
            `services` json DEFAULT NULL,
            `contact_info` json DEFAULT NULL,
            `is_active` tinyint(1) NOT NULL DEFAULT '1',
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Schools table
        "CREATE TABLE IF NOT EXISTS `schools` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `description` text COLLATE utf8mb4_unicode_ci,
            `programs` json DEFAULT NULL,
            `contact_info` json DEFAULT NULL,
            `head_teacher` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `is_active` tinyint(1) NOT NULL DEFAULT '1',
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `schools_type_index` (`type`),
            KEY `schools_level_index` (`level`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Contents table
        "CREATE TABLE IF NOT EXISTS `contents` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `content` longtext COLLATE utf8mb4_unicode_ci,
            `type` enum('text','html','image','video','file','json') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
            `page` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `section` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
            `meta_data` json DEFAULT NULL,
            `is_active` tinyint(1) NOT NULL DEFAULT '1',
            `display_order` int(11) NOT NULL DEFAULT '0',
            `created_by` bigint(20) unsigned DEFAULT NULL,
            `updated_by` bigint(20) unsigned DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            `deleted_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `contents_key_unique` (`key`),
            KEY `contents_page_section_index` (`page`,`section`),
            KEY `contents_key_is_active_index` (`key`,`is_active`),
            KEY `contents_display_order_index` (`display_order`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        // Personal Access Tokens table
        "CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `tokenable_id` bigint(20) unsigned NOT NULL,
            `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
            `abilities` text COLLATE utf8mb4_unicode_ci,
            `last_used_at` timestamp NULL DEFAULT NULL,
            `expires_at` timestamp NULL DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
            KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    ];

    foreach ($tables as $index => $sql) {
        $pdo->exec($sql);
        echo "Table " . ($index + 1) . " created successfully.\n";
    }

    echo "\nAll database tables created successfully!\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
