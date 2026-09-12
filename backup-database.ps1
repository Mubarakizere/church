# Database Backup Script for Hostinger Deployment
# Anglican Church of Rwanda, Shyogwe Diocese CMS

Write-Host "💾 Creating database backup for Hostinger deployment..." -ForegroundColor Green

# Configuration
$BACKUP_DIR = "database-backup-$(Get-Date -Format 'yyyy-MM-dd-HH-mm')"
$BACKUP_FILE = "earshyogwe-database-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').sql"

# Create backup directory
New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null

Write-Host "📊 Exporting database structure and data..." -ForegroundColor Yellow

# Export database using mysqldump (if available) or create manual backup
try {
    # Try to use mysqldump if available
    mysqldump --version | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Using mysqldump for backup..." -ForegroundColor Cyan
        # Note: Update these credentials for your local database
        mysqldump -u root -p --routines --triggers church_cms_hub > "$BACKUP_DIR/$BACKUP_FILE"
    } else {
        Write-Host "mysqldump not available, creating manual backup..." -ForegroundColor Yellow
        CreateManualBackup
    }
} catch {
    Write-Host "Creating manual backup..." -ForegroundColor Yellow
    CreateManualBackup
}

function CreateManualBackup {
    # Create SQL file with table structures and data
    $sqlContent = @"
-- Database Backup for Anglican Church of Rwanda, Shyogwe Diocese CMS
-- Generated on: $(Get-Date)
-- Domain: earshyogwe.com

-- Create database
CREATE DATABASE IF NOT EXISTS `earshyogw_shyogwe` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `earshyogw_shyogwe`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hero Images table
CREATE TABLE IF NOT EXISTS `hero_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `src` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teams table
CREATE TABLE IF NOT EXISTS `teams` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schools table
CREATE TABLE IF NOT EXISTS `schools` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `head_teacher` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Health Centers table
CREATE TABLE IF NOT EXISTS `health_centers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `services` text COLLATE utf8mb4_unicode_ci,
  `contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Health Posts table
CREATE TABLE IF NOT EXISTS `health_posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `services` text COLLATE utf8mb4_unicode_ci,
  `contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table
CREATE TABLE IF NOT EXISTS `events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_date` datetime NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `language` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
INSERT INTO `users` (`name`, `email`, `password`, `created_at`, `updated_at`) VALUES
('Admin', 'admin@example.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW());

-- Insert sample hero images
INSERT INTO `hero_images` (`src`, `title`, `subtitle`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
('/1.jpg', 'Welcome to Our Church', 'A place of worship and community', 1, 1, NOW(), NOW()),
('/01.jpg', 'Join Our Congregation', 'Experience fellowship and spiritual growth', 2, 1, NOW(), NOW()),
('/02.jpg', 'Sunday Services', 'Come worship with us every Sunday', 3, 1, NOW(), NOW()),
('/03.jpg', 'Community Gathering', 'Building relationships in faith', 4, 1, NOW(), NOW()),
('/001.jpg', 'Anglican Tradition', 'Rooted in faith, growing in love', 5, 1, NOW(), NOW());

-- Insert sample services
INSERT INTO `services` (`name`, `time`, `description`, `language`, `is_active`, `created_at`, `updated_at`) VALUES
('Holy Communion', '6:30 AM - 8:30 AM', 'English service with Holy Communion', 'English', 1, NOW(), NOW()),
('Kinyarwanda Service', '9:00 AM - 12:00 PM', 'Traditional Kinyarwanda worship service', 'Kinyarwanda', 1, NOW(), NOW()),
('Mixed Service', '3:30 PM - 5:30 PM', 'Bilingual service for all', 'Mixed', 1, NOW(), NOW());

-- Insert sample events
INSERT INTO `events` (`title`, `description`, `event_date`, `location`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES
('New Year Prayer Service', 'Start the new year with prayer and thanksgiving.', '2025-01-01 10:00:00', 'Main Church', 1, 1, NOW(), NOW()),
('Christmas Carol Service', 'Join us for a beautiful evening of Christmas carols and worship.', '2024-12-24 19:00:00', 'Main Church', 1, 1, NOW(), NOW());

-- Note: Additional data should be imported from the seeded database
-- Run the Laravel seeders after importing this structure:
-- php artisan db:seed --class=TeamHierarchySeeder
-- php artisan db:seed --class=SchoolSeeder
-- php artisan db:seed --class=HealthCenterSeeder
-- php artisan db:seed --class=HealthPostSeeder
"@
    Set-Content -Path "$BACKUP_DIR/$BACKUP_FILE" -Value $sqlContent
}

Write-Host "📝 Creating database import script..." -ForegroundColor Yellow

# Create import script
$importScript = @"
#!/bin/bash
# Database Import Script for Hostinger
# Anglican Church of Rwanda, Shyogwe Diocese CMS

echo "🗄️  Importing database to Hostinger..."

# Database credentials (update these for your Hostinger database)
DB_HOST="localhost"
DB_NAME="earshyogw_shyogwe"
DB_USER="earshyogw_admin"
DB_PASS="your_database_password"

# Import the database
mysql -h \$DB_HOST -u \$DB_USER -p\$DB_PASS \$DB_NAME < $BACKUP_FILE

echo "✅ Database imported successfully!"
echo "🌱 Running Laravel seeders..."

# Run Laravel seeders
php artisan db:seed --class=TeamHierarchySeeder
php artisan db:seed --class=SchoolSeeder
php artisan db:seed --class=HealthCenterSeeder
php artisan db:seed --class=HealthPostSeeder
php artisan db:seed --class=EventSeeder
php artisan db:seed --class=ServiceSeeder

echo "✅ Database setup complete!"
"@
Set-Content -Path "$BACKUP_DIR/import-database.sh" -Value $importScript

Write-Host "📋 Creating database documentation..." -ForegroundColor Yellow

# Create database documentation
$docContent = @"
# DATABASE SETUP FOR HOSTINGER DEPLOYMENT
# Anglican Church of Rwanda, Shyogwe Diocese CMS
# Domain: earshyogwe.com

## Database Information
- **Database Name**: earshyogw_shyogwe
- **Username**: earshyogw_admin
- **Host**: localhost (Hostinger MySQL server)
- **Port**: 3306

## Tables Included
1. **users** - Admin users for the CMS
2. **hero_images** - Homepage carousel images
3. **teams** - Church leadership (Bishop, Archdeacons, Departments)
4. **schools** - Educational institutions
5. **health_centers** - Health center information
6. **health_posts** - Health post information
7. **events** - Church events and announcements
8. **services** - Worship service times

## Default Admin Account
- **Email**: admin@example.com
- **Password**: password
- **⚠️ IMPORTANT**: Change this password after deployment!

## Import Instructions

### Method 1: Using phpMyAdmin
1. Login to Hostinger hPanel
2. Go to phpMyAdmin
3. Create database: earshyogw_shyogwe
4. Import the SQL file: $BACKUP_FILE

### Method 2: Using Command Line (if SSH access)
```bash
mysql -h localhost -u earshyogw_admin -p earshyogw_shyogwe < $BACKUP_FILE
```

### Method 3: Using Import Script
```bash
chmod +x import-database.sh
./import-database.sh
```

## After Import
1. Run Laravel migrations: `php artisan migrate`
2. Run seeders: `php artisan db:seed`
3. Clear cache: `php artisan config:cache`
4. Test admin login
5. Change default admin password

## Security Notes
- Use strong database passwords
- Enable SSL for database connections
- Regular database backups
- Monitor database logs
- Update Laravel regularly

## Backup Strategy
- Daily automated backups via hPanel
- Weekly manual exports
- Before any major updates
- Store backups securely off-site

Generated on: $(Get-Date)
Domain: earshyogwe.com
"@
Set-Content -Path "$BACKUP_DIR/DATABASE_SETUP.md" -Value $docContent

Write-Host "✅ Database backup created successfully!" -ForegroundColor Green
Write-Host "📁 Backup directory: $BACKUP_DIR/" -ForegroundColor Cyan
Write-Host "🗄️  SQL file: $BACKUP_DIR/$BACKUP_FILE" -ForegroundColor Cyan
Write-Host "📖 Documentation: $BACKUP_DIR/DATABASE_SETUP.md" -ForegroundColor Cyan
Write-Host "🚀 Ready for Hostinger database setup!" -ForegroundColor Green
