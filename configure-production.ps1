# Church CMS Production URL Configuration Script
# This script configures all URLs and settings for production deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "church_cms_production",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseUser = "church_cms_user",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabasePassword = ""
)

Write-Host "🔧 Configuring Church CMS for Production Domain: $Domain" -ForegroundColor Green

# Validate domain format
if ($Domain -notmatch '^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$') {
    Write-Host "❌ Invalid domain format. Please provide a valid domain (e.g., example.com)" -ForegroundColor Red
    exit 1
}

# Ensure we're in the right directory
if (-not (Test-Path "backend\artisan")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuring URLs for domain: https://$Domain" -ForegroundColor Green

# 1. Update Frontend API Configuration
Write-Host "📱 Updating frontend API configuration..." -ForegroundColor Cyan

$frontendApiConfig = @"
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://$Domain/api' : 'http://localhost:8000/api');

// Remove trailing slash if present
export const apiConfig = {
  baseURL: API_BASE_URL.replace(/\/$/, ''),
  
  // API endpoints
  endpoints: {
    // Programs (formerly projects)
    programs: '/programs',
    programsAll: '/programs/all',
    programsStatistics: '/programs/statistics',
    programsHealthFacilities: '/programs/health-facilities',
    programsEducationalInstitutions: '/programs/educational-institutions',
    programsImpact: '/programs/impact',
    
    // Auth
    login: '/auth/login',
    logout: '/auth/logout',
    user: '/auth/user',
    
    // Other entities
    events: '/events',
    teams: '/teams',
    services: '/services',
    schools: '/schools',
    healthCenters: '/health-centers',
    healthPosts: '/health-posts',
    heroImages: '/hero-images',
    partners: '/partners',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `{apiConfig.baseURL}{endpoint}`;
};

// Helper function for common API calls
export const apiUrls = {
  programs: () => buildApiUrl(apiConfig.endpoints.programs),
  programsAll: () => buildApiUrl(apiConfig.endpoints.programsAll),
  programsStatistics: () => buildApiUrl(apiConfig.endpoints.programsStatistics),
  programsHealthFacilities: () => buildApiUrl(apiConfig.endpoints.programsHealthFacilities),
  programsEducationalInstitutions: () => buildApiUrl(apiConfig.endpoints.programsEducationalInstitutions),
  programsImpact: () => buildApiUrl(apiConfig.endpoints.programsImpact),
  program: (id: number) => buildApiUrl(`{apiConfig.endpoints.programs}/{id}`),
  
  events: () => buildApiUrl(apiConfig.endpoints.events),
  teams: () => buildApiUrl(apiConfig.endpoints.teams),
  services: () => buildApiUrl(apiConfig.endpoints.services),
  schools: () => buildApiUrl(apiConfig.endpoints.schools),
  healthCenters: () => buildApiUrl(apiConfig.endpoints.healthCenters),
  healthPosts: () => buildApiUrl(apiConfig.endpoints.healthPosts),
  heroImages: () => buildApiUrl(apiConfig.endpoints.heroImages),
  partners: () => buildApiUrl(apiConfig.endpoints.partners),
  partner: (id: number) => buildApiUrl(`{apiConfig.endpoints.partners}/{id}`),
};

export default apiConfig;
"@

$frontendApiConfig | Out-File -FilePath "src\config\api.ts" -Encoding UTF8

# 2. Update Backend Production Environment
Write-Host "🔧 Updating backend production environment..." -ForegroundColor Cyan

$backendEnvProduction = @"
APP_NAME="Church CMS"
APP_ENV=production
APP_KEY=base64:786dc7Z0YJ3m81cpU0+imG474J08bZm6V1J4n8q7D0Y=
APP_DEBUG=false
APP_URL=https://$Domain

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# Production Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=$DatabaseName
DB_USERNAME=$DatabaseUser
DB_PASSWORD=$DatabasePassword

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_DOMAIN=.$Domain

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.$Domain
MAIL_PORT=587
MAIL_USERNAME=noreply@$Domain
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@$Domain"
MAIL_FROM_NAME="Church CMS"

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=$Domain,www.$Domain

# Frontend URL
FRONTEND_URL=https://$Domain

# Production API URL for frontend
VITE_API_URL=https://$Domain/api
VITE_APP_NAME="Church CMS"
"@

$backendEnvProduction | Out-File -FilePath "backend\.env.production" -Encoding UTF8

# 3. Update Frontend Environment Files
Write-Host "🌐 Creating frontend environment files..." -ForegroundColor Cyan

$frontendEnvProduction = @"
VITE_API_URL=https://$Domain/api
VITE_APP_NAME="Church CMS"
VITE_APP_ENV=production
"@

$frontendEnvProduction | Out-File -FilePath ".env.production" -Encoding UTF8

$frontendEnvLocal = @"
VITE_API_URL=https://$Domain/api
VITE_APP_NAME="Church CMS"
VITE_APP_ENV=production
"@

$frontendEnvLocal | Out-File -FilePath ".env.local" -Encoding UTF8

# 4. Update CORS Configuration for Production
Write-Host "🔒 Updating CORS configuration for production..." -ForegroundColor Cyan

$corsConfig = @"
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://$Domain',
        'https://www.$Domain',
        'http://localhost:3000',  // For development
        'http://localhost:8080',  // For development
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
"@

$corsConfig | Out-File -FilePath "backend\config\cors.php" -Encoding UTF8

Write-Host "✅ Configuration completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of changes:" -ForegroundColor Yellow
Write-Host "- Frontend API URL: https://$Domain/api" -ForegroundColor White
Write-Host "- Backend APP_URL: https://$Domain" -ForegroundColor White
Write-Host "- CORS origins: https://$Domain, https://www.$Domain" -ForegroundColor White
Write-Host "- Sanctum domains: $Domain, www.$Domain" -ForegroundColor White
Write-Host "- Session domain: .$Domain" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update database credentials in backend\.env.production" -ForegroundColor White
Write-Host "2. Run: npm run build" -ForegroundColor White
Write-Host "3. Upload files to your server" -ForegroundColor White
Write-Host "4. Copy backend\.env.production to backend\.env on server" -ForegroundColor White
Write-Host "5. Run: php artisan migrate --force" -ForegroundColor White
Write-Host "6. Run: php artisan partners:update-urls" -ForegroundColor White
