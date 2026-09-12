<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'description',
        'location',
        'head_teacher',
        'contact_phone',
        'contact_email',
        'image',
        'founded_year',
        'programs_offered',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'programs_offered' => 'array',
        'is_active' => 'boolean',
        'founded_year' => 'integer',
    ];

    /**
     * Scope to get schools by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type)->where('is_active', true);
    }

    /**
     * Get schools grouped by type
     */
    public static function getByTypeGrouped()
    {
        return [
            'ecd' => self::where('type', 'ecd')->where('is_active', true)->get(),
            'primary' => self::where('type', 'primary')->where('is_active', true)->get(),
            'secondary_basic' => self::where('type', 'secondary_basic')->where('is_active', true)->get(),
            'secondary_boarding' => self::where('type', 'secondary_boarding')->where('is_active', true)->get(),
            'tss_boarding' => self::where('type', 'tss_boarding')->where('is_active', true)->get(),
            'university' => self::where('type', 'university')->where('is_active', true)->get(),
        ];
    }

    /**
     * Get school statistics
     */
    public static function getStatistics()
    {
        return [
            'ecd' => self::where('type', 'ecd')->where('is_active', true)->count(),
            'primary' => self::where('type', 'primary')->where('is_active', true)->count(),
            'secondary_basic' => self::where('type', 'secondary_basic')->where('is_active', true)->count(),
            'secondary_boarding' => self::where('type', 'secondary_boarding')->where('is_active', true)->count(),
            'tss_boarding' => self::where('type', 'tss_boarding')->where('is_active', true)->count(),
            'university' => self::where('type', 'university')->where('is_active', true)->count(),
            'total' => self::where('is_active', true)->count(),
        ];
    }
}
