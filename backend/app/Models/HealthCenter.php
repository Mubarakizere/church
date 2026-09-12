<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HealthCenter extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'location',
        'contact_phone',
        'contact_email',
        'image',
        'services',
        'operating_hours',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'services' => 'array',
        'is_active' => 'boolean',
    ];
}
