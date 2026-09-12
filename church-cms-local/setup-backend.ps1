# Church CMS Local Backend Setup Script
# This script sets up the Laravel backend for local development

Write-Host "🚀 Setting up Church CMS Local Backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location "backend"

# Create .env file
Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
@"
APP_NAME="Church CMS Local"
APP_ENV=local
APP_KEY=base64:YourAppKeyHere123456789012345678901234567890=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

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
MAIL_FROM_ADDRESS="hello@example.com"
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

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://127.0.0.1:8080,http://127.0.0.1:3000
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin
CORS_SUPPORTS_CREDENTIALS=true
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Generate application key
Write-Host "🔑 Generating application key..." -ForegroundColor Yellow
php artisan key:generate

# Create storage symlink
Write-Host "🔗 Creating storage symlink..." -ForegroundColor Yellow
php artisan storage:link

# Run database migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
php artisan migrate

# Seed the database
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
php artisan db:seed

# Clear caches
Write-Host "🧹 Clearing caches..." -ForegroundColor Yellow
php artisan config:clear
php artisan cache:clear
php artisan route:clear

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host "🚀 To start the backend server, run: php artisan serve --port=8000" -ForegroundColor Cyan
Write-Host "🌐 Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📡 API endpoints will be at: http://localhost:8000/api" -ForegroundColor Cyan

# Return to parent directory
Set-Location ".."
