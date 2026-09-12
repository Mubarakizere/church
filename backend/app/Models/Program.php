<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $table = 'programs';

    protected $fillable = [
        'title',
        'description',
        'category',
        'location',
        'attendees',
        'featured',
        'is_active',
        'start_date',
        'recurrence_pattern',
        'metadata'
    ];

    protected $casts = [
        'featured' => 'boolean',
        'is_active' => 'boolean',
        'start_date' => 'date',
        'metadata' => 'array',
    ];
}
