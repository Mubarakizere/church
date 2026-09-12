<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class SecureDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'file_path',
        'original_filename',
        'file_type',
        'file_size',
        'access_level',
        'password',
        'allowed_roles',
        'is_public',
        'is_active',
        'download_allowed',
        'download_count',
        'view_count',
        'last_downloaded_at',
        'uploaded_by',
    ];

    protected $casts = [
        'allowed_roles' => 'array',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
        'download_allowed' => 'boolean',
        'view_count' => 'integer',
        'last_downloaded_at' => 'datetime',
    ];

    protected $hidden = [
        'password', // Never expose password hash in API
        'file_path', // Never expose actual file path
    ];

    protected $appends = [
        'file_size_human',
        'requires_password',
        'requires_role',
        'can_view_inline',
    ];

    /**
     * Relationship: Downloads
     */
    public function downloads()
    {
        return $this->hasMany(SecureDocumentDownload::class);
    }

    /**
     * Relationship: Uploader
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Check if document is publicly accessible
     */
    public function isPublicAccess(): bool
    {
        return $this->access_level === 'public' && $this->is_public;
    }

    /**
     * Check if document requires password
     */
    public function requiresPassword(): bool
    {
        return $this->access_level === 'password';
    }

    /**
     * Check if document requires role-based permission
     */
    public function requiresRole(): bool
    {
        return $this->access_level === 'role_based';
    }

    /**
     * Verify password
     */
    public function verifyPassword(string $password): bool
    {
        if (!$this->requiresPassword()) {
            return false;
        }
        
        return Hash::check($password, $this->password);
    }

    /**
     * Check if user has required role
     */
    public function userHasAccess(?User $user): bool
    {
        // Public documents are accessible to everyone
        if ($this->isPublicAccess()) {
            return true;
        }

        // Password-protected documents need password verification (handled separately)
        if ($this->requiresPassword()) {
            return false; // Password must be verified through verifyPassword()
        }

        // Role-based documents require authentication and role check
        if ($this->requiresRole()) {
            if (!$user) {
                return false;
            }

            // Check if user has any of the allowed roles
            if (empty($this->allowed_roles)) {
                return false;
            }

            // Assuming user has a 'role' attribute
            return in_array($user->role ?? 'guest', $this->allowed_roles);
        }

        return false;
    }

    /**
     * Increment download counter
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
        $this->update(['last_downloaded_at' => now()]);
    }

    /**
     * Increment view counter
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Check if user can download this document
     * Admins can always download
     */
    public function canDownload(?User $user = null): bool
    {
        // Admins can always download
        if ($user && $user->role === 'admin') {
            return true;
        }
        
        // Otherwise, respect the download_allowed setting
        return $this->download_allowed;
    }

    /**
     * Log download activity
     */
    public function logDownload(?User $user, string $accessMethod, bool $granted = true): void
    {
        SecureDocumentDownload::create([
            'secure_document_id' => $this->id,
            'user_id' => $user?->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'access_granted' => $granted,
            'access_method' => $accessMethod,
            'downloaded_at' => now(),
        ]);
    }

    /**
     * Get human-readable file size
     */
    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get requires_password attribute for API
     */
    public function getRequiresPasswordAttribute(): bool
    {
        return $this->requiresPassword();
    }

    /**
     * Get requires_role attribute for API
     */
    public function getRequiresRoleAttribute(): bool
    {
        return $this->requiresRole();
    }

    /**
     * Get can_view_inline attribute for API
     * Determines if document can be viewed in browser (primarily PDFs)
     */
    public function getCanViewInlineAttribute(): bool
    {
        // PDF files can be viewed inline in browser
        // Other formats will use Google Docs Viewer
        return in_array(strtolower($this->file_type), ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']);
    }

    /**
     * Get file icon based on file type
     */
    public function getFileIcon(): string
    {
        $iconMap = [
            'pdf' => 'file-pdf',
            'doc' => 'file-word',
            'docx' => 'file-word',
            'xls' => 'file-excel',
            'xlsx' => 'file-excel',
            'ppt' => 'file-powerpoint',
            'pptx' => 'file-powerpoint',
            'txt' => 'file-text',
            'rtf' => 'file-text',
            'odt' => 'file-text',
        ];

        return $iconMap[$this->file_type] ?? 'file';
    }

    /**
     * Delete file from storage when model is deleted
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($document) {
            // Delete from public disk (same as images)
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
        });
    }
}
