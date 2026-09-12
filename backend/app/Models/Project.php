<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    // Use the programs table instead of projects
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
        'metadata' => 'array'
    ];

    // Add accessor for backward compatibility
    public function getNameAttribute()
    {
        return $this->title;
    }

    public function getTypeAttribute()
    {
        return $this->category;
    }

    public function getBeneficiariesAttribute()
    {
        return $this->attendees;
    }

    public function getStatusAttribute()
    {
        return $this->is_active ? 'active' : 'inactive';
    }

    public function getEndDateAttribute()
    {
        return null; // Programs don't have end dates, they have recurrence patterns
    }
}
