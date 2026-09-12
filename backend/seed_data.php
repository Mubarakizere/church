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

    // Insert basic team data
    $teamData = [
        [
            'name' => 'Rt. Rev. Jered Kalimba',
            'position' => 'Bishop',
            'title' => 'Bishop of Shyogwe Diocese',
            'bio' => 'Leading the Anglican Church of Rwanda, Shyogwe Diocese with dedication and spiritual guidance.',
            'description' => 'Bishop Jered Kalimba serves as the spiritual leader of Shyogwe Diocese, overseeing the pastoral care and administrative functions of the diocese.',
            'email' => 'bishop@shyogwe.org',
            'phone' => '+250 788 100 001',
            'category' => 'bishop',
            'is_active' => 1,
            'display_order' => 1
        ],
        [
            'name' => 'Rev. Canon John Rutayisire',
            'position' => 'Archdeacon',
            'title' => 'Archdeacon of Muhanga',
            'bio' => 'Serving the Muhanga region with pastoral care and community development.',
            'description' => 'Archdeacon John oversees the churches and ministries in the Muhanga region.',
            'email' => 'muhanga@shyogwe.org',
            'phone' => '+250 788 100 002',
            'category' => 'archdeacon',
            'region' => 'muhanga',
            'is_active' => 1,
            'display_order' => 2
        ],
        [
            'name' => 'Rev. Canon Mary Uwimana',
            'position' => 'Archdeacon',
            'title' => 'Archdeacon of Kamonyi',
            'bio' => 'Leading the Kamonyi region with compassion and dedication.',
            'description' => 'Archdeacon Mary serves the Kamonyi region with focus on women and youth ministries.',
            'email' => 'kamonyi@shyogwe.org',
            'phone' => '+250 788 100 003',
            'category' => 'archdeacon',
            'region' => 'kamonyi',
            'is_active' => 1,
            'display_order' => 3
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO teams (name, position, title, bio, description, email, phone, category, region, is_active, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");

    foreach ($teamData as $member) {
        $stmt->execute([
            $member['name'],
            $member['position'],
            $member['title'],
            $member['bio'],
            $member['description'],
            $member['email'],
            $member['phone'],
            $member['category'],
            $member['region'] ?? null,
            $member['is_active'],
            $member['display_order']
        ]);
    }

    echo "Team data inserted successfully.\n";

    // Insert basic content data
    $contentData = [
        [
            'key' => 'home_hero_title',
            'title' => 'Hero Title',
            'content' => 'Welcome to Anglican Church of Rwanda, Shyogwe Diocese',
            'type' => 'text',
            'page' => 'home',
            'section' => 'hero',
            'display_order' => 1
        ],
        [
            'key' => 'services_english_time',
            'title' => 'English Service Time',
            'content' => '6:30 AM - 8:30 AM',
            'type' => 'text',
            'page' => 'services',
            'section' => 'times',
            'display_order' => 1
        ],
        [
            'key' => 'services_kinyarwanda_time',
            'title' => 'Kinyarwanda Service Time',
            'content' => '9:00 AM - 12:00 PM',
            'type' => 'text',
            'page' => 'services',
            'section' => 'times',
            'display_order' => 2
        ],
        [
            'key' => 'services_mixed_time',
            'title' => 'Mixed Service Time',
            'content' => '3:30 PM - 5:30 PM',
            'type' => 'text',
            'page' => 'services',
            'section' => 'times',
            'display_order' => 3
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO contents (`key`, title, content, type, page, section, display_order, is_active, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 1, NOW(), NOW())");

    foreach ($contentData as $content) {
        $stmt->execute([
            $content['key'],
            $content['title'],
            $content['content'],
            $content['type'],
            $content['page'],
            $content['section'],
            $content['display_order']
        ]);
    }

    echo "Content data inserted successfully.\n";

    // Insert basic user
    $hashedPassword = password_hash('shyogwe2024', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
    $stmt->execute(['Admin', 'admin@shyogwe.org', $hashedPassword]);

    echo "Admin user created successfully.\n";
    echo "\nDatabase setup completed successfully!\n";
    echo "Admin login: admin@shyogwe.org / shyogwe2024\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
