<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecureDocumentDownload extends Model
{
    use HasFactory;

    protected $fillable = [
        'secure_document_id',
        'user_id',
        'ip_address',
        'user_agent',
        'access_granted',
        'access_method',
        'downloaded_at',
    ];

    protected $casts = [
        'access_granted' => 'boolean',
        'downloaded_at' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relationship: Document
     */
    public function document()
    {
        return $this->belongsTo(SecureDocument::class, 'secure_document_id');
    }

    /**
     * Relationship: User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
