#!/bin/bash
# Web Server Symlink Configuration Fix
# This script helps diagnose and fix web server issues with symlinks

echo "🔧 Web Server Symlink Configuration Fix"
echo "========================================"
echo ""

echo "🔍 DIAGNOSIS:"
echo "============="
echo "✅ HTTP 200 - Request successful"
echo "❌ Content-Type: text/html (should be image/jpeg)"
echo "❌ Content-Length: 1535 bytes (too small for JPEG)"
echo ""
echo "💡 ISSUE IDENTIFIED:"
echo "   The web server (LiteSpeed) is serving HTML instead of the image file"
echo "   This indicates the web server isn't following symlinks properly"
echo ""

echo "🚀 SOLUTIONS TO TRY:"
echo "===================="
echo ""

echo "1️⃣  COPY FILES APPROACH (Recommended for shared hosting):"
echo "   Instead of symlinks, copy files to public directory"
echo ""
echo "   Commands:"
echo "   rm -rf public/storage"
echo "   mkdir -p public/storage"
echo "   cp -r storage/app/public/* public/storage/"
echo "   chmod -R 755 public/storage/"
echo ""

echo "2️⃣  CHECK WEB SERVER CONFIGURATION:"
echo "   LiteSpeed needs to be configured to follow symlinks"
echo "   This usually requires server admin access"
echo ""

echo "3️⃣  TEST DIRECT FILE ACCESS:"
echo "   Test if files are accessible without symlinks"
echo "   curl -I https://earshyogwe.com/api/public/storage/team-images/[filename].jpg"
echo ""

echo "4️⃣  CHECK .HTACCESS CONFIGURATION:"
echo "   Ensure .htaccess allows symlink following"
echo "   Add: Options +FollowSymLinks"
echo ""

echo "🔧 IMMEDIATE FIX - COPY FILES METHOD:"
echo "====================================="
echo ""

read -p "Do you want to try the copy files approach? (y/n): " copy_files

if [ "$copy_files" = "y" ]; then
    echo ""
    echo "🚀 Implementing copy files approach..."
    echo ""
    
    # Remove symlink
    echo "1. Removing symlink..."
    rm -rf public/storage
    echo "✅ Symlink removed"
    
    # Create directory
    echo "2. Creating storage directory..."
    mkdir -p public/storage
    echo "✅ Directory created"
    
    # Copy files
    echo "3. Copying files from storage/app/public to public/storage..."
    if [ -d "storage/app/public" ]; then
        cp -r storage/app/public/* public/storage/
        echo "✅ Files copied"
        
        # Set permissions
        echo "4. Setting permissions..."
        chmod -R 755 public/storage/
        echo "✅ Permissions set"
        
        # Test file access
        echo "5. Testing file access..."
        if [ -f "public/storage/team-images/vrhKvRVALbQnxN7DIc1N0mSp3u7ntB8IcQVB5U0Q.jpg" ]; then
            echo "✅ Test file accessible locally"
        else
            echo "❌ Test file not found"
        fi
        
        echo ""
        echo "🧪 TEST THE FIX:"
        echo "   curl -I https://earshyogwe.com/storage/team-images/vrhKvRVALbQnxN7DIc1N0mSp3u7ntB8IcQVB5U0Q.jpg"
        echo ""
        echo "   Expected result:"
        echo "   - HTTP 200"
        echo "   - Content-Type: image/jpeg"
        echo "   - Content-Length: [actual file size]"
        
    else
        echo "❌ Source directory storage/app/public not found"
    fi
    
else
    echo ""
    echo "📋 MANUAL STEPS:"
    echo "================"
    echo "1. Try the copy files approach manually"
    echo "2. Contact your hosting provider about LiteSpeed symlink support"
    echo "3. Check if you have access to server configuration"
    echo "4. Consider using a different hosting provider if symlinks are essential"
fi

echo ""
echo "💡 WHY THIS HAPPENS:"
echo "==================="
echo "• Shared hosting often disables symlink following for security"
echo "• LiteSpeed may need specific configuration to follow symlinks"
echo "• Copying files is a common workaround for shared hosting"
echo "• The copy approach works but requires manual updates when files change"
echo ""

echo "✅ Try the copy files approach - it should resolve the issue!"
