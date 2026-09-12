# Church CMS Local Backend Setup

This guide will help you set up the Laravel backend for the Church CMS local development environment.

## Prerequisites

Before starting, make sure you have the following installed:

- **PHP 8.1 or higher** - [Download PHP](https://www.php.net/downloads.php)
- **Composer** - [Download Composer](https://getcomposer.org/download/)
- **SQLite** (usually included with PHP)

## Quick Setup

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```powershell
   .\setup-backend.ps1
   ```

2. **Start the backend server:**
   ```powershell
   .\start-backend.bat
   ```
   Or manually:
   ```bash
   cd backend
   php artisan serve --port=8000
   ```

### Option 2: Manual Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Create .env file:**
   ```bash
   copy .env.example .env
   ```
   (Or create .env manually with the configuration below)

4. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

5. **Create storage symlink:**
   ```bash
   php artisan storage:link
   ```

6. **Run database migrations:**
   ```bash
   php artisan migrate
   ```

7. **Seed the database:**
   ```bash
   php artisan db:seed
   ```

8. **Start the server:**
   ```bash
   php artisan serve --port=8000
   ```

## Configuration

The backend is configured to use:

- **Database:** SQLite (`database/database.sqlite`)
- **Port:** 8000
- **CORS:** Enabled for frontend on port 8080
- **Environment:** Local development

## API Endpoints

Once running, the backend will provide API endpoints at:

- **Base URL:** `http://localhost:8000/api`
- **Events:** `GET /api/events`
- **Services:** `GET /api/services`
- **Team:** `GET /api/team`
- **Projects:** `GET /api/projects`
- **Health Centers:** `GET /api/health-centers`
- **Schools:** `GET /api/schools`
- **Partners:** `GET /api/partners`

## Frontend Connection

The frontend is already configured to connect to the backend at `http://localhost:8000/api`. Once both are running:

1. **Frontend:** `http://localhost:8080` (Vite dev server)
2. **Backend:** `http://localhost:8000` (Laravel server)

## Troubleshooting

### Common Issues:

1. **Port 8000 already in use:**
   ```bash
   php artisan serve --port=8001
   ```
   Then update frontend config to use port 8001.

2. **Database errors:**
   ```bash
   php artisan migrate:fresh --seed
   ```

3. **Storage symlink issues:**
   ```bash
   php artisan storage:link --force
   ```

4. **Permission errors:**
   Make sure the `storage` and `bootstrap/cache` directories are writable.

### Logs

Check Laravel logs at: `backend/storage/logs/laravel.log`

## Development Commands

```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Reset database
php artisan migrate:fresh --seed

# Check routes
php artisan route:list

# Run tests
php artisan test
```

## Next Steps

1. Start the backend server
2. Start the frontend server (`npm run dev`)
3. Open `http://localhost:8080` in your browser
4. The frontend should now connect to the backend and show real data!

## Support

If you encounter any issues, check:
- PHP version compatibility
- Composer dependencies
- Database file permissions
- Port availability
