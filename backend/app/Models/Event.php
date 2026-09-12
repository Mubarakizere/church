<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'date',
        'time',
        'location',
        'image',
        'status',
        'attendees',
        'featured',
        'is_recurring',
        'recurrence_pattern'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'featured' => 'boolean',
        'is_recurring' => 'boolean',
        'date' => 'date'
    ];

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming')->where('date', '>=', now());
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('date', 'asc')->orderBy('time', 'asc');
    }
}
