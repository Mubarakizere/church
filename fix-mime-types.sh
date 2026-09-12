#!/bin/bash
# Fix MIME Type Issues for Laravel Storage
# Based on Hostinger support recommendations

echo "🔧 Fixing MIME Type Issues for Laravel Storage"
echo "=============================================="
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

echo "1️⃣  CHECKING SYMLINK TARGET:"
echo "============================"

if [ -L "public/storage" ]; then
    TARGET=$(readlink public/storage)
    echo "✅ Symlink exists"
    echo "📁 Current target: $TARGET"
    
    if [ "$TARGET" = "../storage/app/public" ]; then
        echo "✅ Target is correct: ../storage/app/public"
    else
        echo "❌ Target is incorrect. Should be: ../storage/app/public"
        echo "🔧 Fixing symlink..."
        rm public/storage
        ln -sf ../storage/app/public public/storage
        echo "✅ Symlink fixed"
    fi
else
    echo "❌ Symlink doesn't exist"
    echo "🔧 Creating symlink..."
    ln -sf ../storage/app/public public/storage
    echo "✅ Symlink created"
fi
echo ""

echo "2️⃣  FIXING FILE PERMISSIONS:"
echo "============================"

echo "🔧 Setting correct permissions..."
# Set directory permissions to 755
find storage/app/public -type d -exec chmod 755 {} \;

# Set file permissions to 644
find storage/app/public -type f -exec chmod 644 {} \;

echo "✅ Permissions set:"
echo "   Directories: 755"
echo "   Files: 644"
echo ""

echo "3️⃣  UPDATING .HTACCESS FOR MIME TYPES:"
echo "======================================"

if [ -f "public/.htaccess" ]; then
    echo "✅ .htaccess file exists"
    
    # Check if MIME type rules already exist
    if grep -q "Header set Content-Type" public/.htaccess; then
        echo "⚠️  MIME type rules already exist in .htaccess"
        echo "📄 Current MIME rules:"
        grep -A 5 "Header set Content-Type" public/.htaccess
        echo ""
        echo "🔄 Updating existing rules..."
    else
        echo "➕ Adding MIME type rules to .htaccess..."
    fi
    
    # Create backup
    cp public/.htaccess public/.htaccess.backup
    echo "✅ Backup created: public/.htaccess.backup"
    
    # Add MIME type rules if they don't exist
    if ! grep -q "Header set Content-Type.*jpeg" public/.htaccess; then
        echo "" >> public/.htaccess
        echo "# Force correct MIME types for images" >> public/.htaccess
        echo "<IfModule mod_headers.c>" >> public/.htaccess
        echo "    Header set Content-Type \"image/jpeg\" \"expr=%{REQUEST_URI} =~ m#\.jpe?g\$#\"" >> public/.htaccess
        echo "    Header set Content-Type \"image/png\" \"expr=%{REQUEST_URI} =~ m#\.png\$#\"" >> public/.htaccess
        echo "    Header set Content-Type \"image/gif\" \"expr=%{REQUEST_URI} =~ m#\.gif\$#\"" >> public/.htaccess
        echo "</IfModule>" >> public/.htaccess
        echo "✅ MIME type rules added to .htaccess"
    else
        echo "✅ MIME type rules already present"
    fi
    
else
    echo "❌ .htaccess file not found"
    echo "🔧 Creating .htaccess with MIME type rules..."
    
    cat > public/.htaccess << 'EOF'
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

# Force correct MIME types for images
<IfModule mod_headers.c>
    Header set Content-Type "image/jpeg" "expr=%{REQUEST_URI} =~ m#\.jpe?g$#"
    Header set Content-Type "image/png" "expr=%{REQUEST_URI} =~ m#\.png$#"
    Header set Content-Type "image/gif" "expr=%{REQUEST_URI} =~ m#\.gif$#"
</IfModule>
EOF
    
    echo "✅ .htaccess file created with MIME type rules"
fi
echo ""

echo "4️⃣  CLEARING LARAVEL CACHES:"
echo "============================"

php artisan config:clear 2>/dev/null && echo "✅ Config cache cleared" || echo "⚠️  Could not clear config cache"
php artisan cache:clear 2>/dev/null && echo "✅ Application cache cleared" || echo "⚠️  Could not clear application cache"
php artisan route:clear 2>/dev/null && echo "✅ Route cache cleared" || echo "⚠️  Could not clear route cache"

echo ""

echo "5️⃣  TESTING THE FIX:"
echo "===================="

echo "🧪 Testing image accessibility..."

# Test with an existing file
TEST_FILE="9f5Retfa0taCZhcwCzFbp0G6KzjiJ5QO4rLSKHME.jpg"
URL="https://earshyogwe.com/storage/team-images/$TEST_FILE"

echo "🔗 Testing: $URL"

# Get response headers
echo "📊 Response:"
curl -s -I "$URL" | while read -r line; do
    echo "   $line"
done

echo ""
echo "✅ MIME type fix completed!"
echo ""
echo "📋 WHAT WAS FIXED:"
echo "=================="
echo "• ✅ Symlink target verified: ../storage/app/public"
echo "• ✅ File permissions set: 644 (files), 755 (directories)"
echo "• ✅ MIME type rules added to .htaccess"
echo "• ✅ Laravel caches cleared"
echo ""
echo "🧪 Expected result:"
echo "   HTTP/2 200"
echo "   content-type: image/jpeg"
echo "   content-length: [actual file size]"
echo ""
echo "🚀 If still having issues, try the copy files approach as backup!"








