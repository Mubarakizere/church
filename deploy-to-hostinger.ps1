# Hostinger Deployment Script for earshyogwe.com
# Anglican Church of Rwanda, Shyogwe Diocese CMS

Write-Host "🚀 Preparing deployment for earshyogwe.com on Hostinger..." -ForegroundColor Green

# Configuration
$DOMAIN = "earshyogwe.com"
$BACKUP_DIR = "backup-$(Get-Date -Format 'yyyy-MM-dd-HH-mm')"
$DEPLOY_DIR = "hostinger-deployment"

# Create deployment directory
if (Test-Path $DEPLOY_DIR) {
    Remove-Item $DEPLOY_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $DEPLOY_DIR | Out-Null

Write-Host "📦 Building frontend for production..." -ForegroundColor Yellow
# Build frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Frontend build failed!"
    exit 1
}

Write-Host "📁 Copying frontend build files..." -ForegroundColor Yellow
# Copy frontend build to deployment directory
Copy-Item "dist/*" "$DEPLOY_DIR/" -Recurse -Force

Write-Host "📁 Copying backend files..." -ForegroundColor Yellow
# Copy backend files
Copy-Item "backend" "$DEPLOY_DIR/backend" -Recurse -Force

Write-Host "📁 Copying configuration files..." -ForegroundColor Yellow
# Copy important configuration files
Copy-Item "public/*" "$DEPLOY_DIR/public/" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "📝 Creating .htaccess for Laravel..." -ForegroundColor Yellow
# Create .htaccess for Laravel backend
$htaccessContent = @"
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
"@
Set-Content -Path "$DEPLOY_DIR/backend/public/.htaccess" -Value $htaccessContent

Write-Host "📝 Creating production environment file..." -ForegroundColor Yellow
# Create production .env file
$envContent = @"
APP_NAME="Anglican Church of Rwanda, Shyogwe Diocese"
APP_ENV=production
APP_KEY=base64:$(php artisan key:generate --show | Select-String -Pattern "base64:" | ForEach-Object { $_.Line.Split(':')[1] })
APP_DEBUG=false
APP_URL=https://earshyogwe.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=earshyogw_shyogwe
DB_USERNAME=earshyogw_admin
DB_PASSWORD=your_database_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@earshyogwe.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
"@
Set-Content -Path "$DEPLOY_DIR/backend/.env" -Value $envContent

Write-Host "📝 Creating deployment instructions..." -ForegroundColor Yellow
# Create deployment instructions
$instructions = @"
# HOSTINGER DEPLOYMENT INSTRUCTIONS
# Anglican Church of Rwanda, Shyogwe Diocese CMS
# Domain: earshyogwe.com

## 1. UPLOAD FILES TO HOSTINGER

### Via File Manager:
1. Login to Hostinger hPanel
2. Go to File Manager
3. Navigate to public_html folder
4. Upload all files from the deployment folder

### Via FTP/SFTP:
- Host: earshyyogwe.com or IP address
- Username: earshyogw_admin
- Password: [your FTP password]
- Upload all files to public_html

## 2. DATABASE SETUP

1. Create MySQL database in hPanel:
   - Database name: earshyogw_shyogwe
   - Username: earshyogw_admin
   - Password: [strong password]

2. Import database:
   - Use phpMyAdmin in hPanel
   - Import the database file from backend/database/

## 3. CONFIGURE ENVIRONMENT

1. Edit .env file in backend folder:
   - Update DB_DATABASE, DB_USERNAME, DB_PASSWORD
   - Update APP_URL to https://earshyogwe.com
   - Update MAIL settings if needed

2. Set file permissions:
   - chmod 755 backend/storage
   - chmod 755 backend/bootstrap/cache

## 4. RUN LARAVEL COMMANDS

Via Terminal/SSH in hPanel:
```bash
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate
php artisan db:seed
```

## 5. CONFIGURE WEB SERVER

### Apache Configuration:
- Ensure mod_rewrite is enabled
- .htaccess file is already included

### Nginx Configuration (if applicable):
```nginx
location / {
    try_files \$uri \$uri/ /index.php?\$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
    include fastcgi_params;
}
```

## 6. SSL CERTIFICATE

1. Enable SSL in hPanel
2. Force HTTPS redirects
3. Update APP_URL to https://earshyogwe.com

## 7. TESTING

After deployment, test:
1. Frontend loads at https://earshyogwe.com
2. Admin login works at https://earshyogwe.com/admin/login
3. API endpoints work at https://earshyogwe.com/api/
4. Database connections work
5. File uploads work

## 8. MAINTENANCE

- Regular backups via hPanel
- Monitor error logs
- Keep Laravel and dependencies updated
- Monitor database performance

## CONTACT

For technical support, contact the development team.

Generated on: $(Get-Date)
Domain: earshyogwe.com
"@
Set-Content -Path "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" -Value $instructions

Write-Host "📦 Creating deployment archive..." -ForegroundColor Yellow
# Create zip archive for easy upload
Compress-Archive -Path "$DEPLOY_DIR/*" -DestinationPath "earshyogwe-deployment-$(Get-Date -Format 'yyyy-MM-dd').zip" -Force

Write-Host "✅ Deployment package ready!" -ForegroundColor Green
Write-Host "📁 Deployment files: $DEPLOY_DIR/" -ForegroundColor Cyan
Write-Host "📦 Archive: earshyogwe-deployment-$(Get-Date -Format 'yyyy-MM-dd').zip" -ForegroundColor Cyan
Write-Host "📖 Instructions: $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready for Hostinger deployment to earshyogwe.com!" -ForegroundColor Green
