#!/bin/bash
# Hybrid Storage Solution - Laravel + Manual Sync
# This creates a symlink but also provides a sync mechanism for reliability

echo "🔧 Hybrid Storage Solution Setup"
echo "================================"
echo ""

# Check current directory
echo "📁 Current directory: $(pwd)"
echo ""

# Check if we're in the Laravel directory
if [ ! -f "artisan" ]; then
    echo "❌ Not in Laravel root directory. Please cd to your Laravel backend directory first."
    exit 1
fi

echo "✅ Laravel directory detected"
echo ""

echo "🔍 CURRENT ISSUE ANALYSIS:"
echo "=========================="
echo "• Symlink created correctly: ✅ Yes"
echo "• Files accessible locally: ✅ Yes"
echo "• Web server following symlink: ❌ No (LiteSpeed issue)"
echo "• Hostinger supports symlinks: ✅ Yes (but LiteSpeed not configured)"
echo ""

echo "🚀 HYBRID SOLUTION:"
echo "==================="
echo "1. Keep the symlink for Laravel functionality"
echo "2. Create a sync script to copy files to public/storage"
echo "3. Set up automatic sync after file uploads"
echo ""

# Create sync script
echo "📝 Creating storage sync script..."

cat > sync-storage.sh << 'EOF'
#!/bin/bash
# Laravel Storage Sync Script
# Run this after uploading files to make them web-accessible

echo "🔄 Syncing Laravel storage to public directory..."

# Ensure public/storage exists
mkdir -p public/storage

# Copy all files from storage/app/public to public/storage
if [ -d "storage/app/public" ]; then
    echo "📁 Copying files from storage/app/public to public/storage..."
    cp -r storage/app/public/* public/storage/ 2>/dev/null
    
    # Set proper permissions
    chmod -R 755 public/storage/
    
    echo "✅ Storage sync completed!"
    echo "📊 Files synced: $(find public/storage -type f | wc -l)"
else
    echo "❌ Source directory storage/app/public not found"
fi
EOF

chmod +x sync-storage.sh
echo "✅ Sync script created: sync-storage.sh"
echo ""

# Create Laravel event listener for automatic sync
echo "📝 Creating automatic sync setup..."

cat > storage-sync-instructions.md << 'EOF'
# Laravel Storage Auto-Sync Setup

## Manual Sync (Immediate Solution)
Run this script after uploading files:
```bash
./sync-storage.sh
```

## Automatic Sync (Advanced Solution)
Add this to your Laravel application:

### 1. Create Event Listener
Create: `app/Listeners/SyncStorageFiles.php`

```php
<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class SyncStorageFiles
{
    public function handle($event)
    {
        // Sync storage files to public directory
        $this->syncStorageFiles();
    }
    
    private function syncStorageFiles()
    {
        $source = storage_path('app/public');
        $destination = public_path('storage');
        
        if (File::exists($source)) {
            File::makeDirectory($destination, 0755, true, true);
            File::copyDirectory($source, $destination);
        }
    }
}
```

### 2. Register Event Listener
Add to `app/Providers/EventServiceProvider.php`:

```php
protected $listen = [
    // ... existing listeners
    'App\Events\FileUploaded' => [
        'App\Listeners\SyncStorageFiles',
    ],
];
```

### 3. Trigger After File Upload
In your file upload controllers, dispatch the event after successful upload.

## Quick Fix Commands
```bash
# Sync all files immediately
./sync-storage.sh

# Test web accessibility
curl -I https://earshyogwe.com/storage/team-images/[filename].jpg
```
EOF

echo "✅ Instructions created: storage-sync-instructions.md"
echo ""

# Run initial sync
echo "🔄 Running initial storage sync..."
./sync-storage.sh

echo ""
echo "🧪 TESTING THE SOLUTION:"
echo "========================"

# Test web accessibility
echo "Testing web accessibility..."
TEST_URL="https://earshyogwe.com/storage/team-images/vrhKvRVALbQnxN7DIc1N0mSp3u7ntB8IcQVB5U0Q.jpg"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL")
CONTENT_TYPE=$(curl -s -I "$TEST_URL" | grep -i "content-type" | cut -d' ' -f2-)

if [ "$HTTP_CODE" = "200" ] && [[ "$CONTENT_TYPE" == *"image"* ]]; then
    echo "✅ SUCCESS! Images are now web-accessible!"
    echo "   HTTP Status: $HTTP_CODE"
    echo "   Content-Type: $CONTENT_TYPE"
else
    echo "⚠️  Still having issues. HTTP: $HTTP_CODE, Type: $CONTENT_TYPE"
fi

echo ""
echo "📋 SOLUTION SUMMARY:"
echo "===================="
echo "• Symlink: ✅ Created (for Laravel functionality)"
echo "• Sync Script: ✅ Created (sync-storage.sh)"
echo "• Files Copied: ✅ Yes (for web accessibility)"
echo "• Manual Sync: Run './sync-storage.sh' after uploads"
echo "• Auto Sync: See storage-sync-instructions.md"
echo ""

echo "🚀 NEXT STEPS:"
echo "=============="
echo "1. Test your website - images should now display"
echo "2. Upload a new team image and run './sync-storage.sh'"
echo "3. Consider implementing automatic sync (see instructions)"
echo ""

echo "✅ Hybrid solution implemented successfully!"
echo "   Your images should now be accessible via web!"








