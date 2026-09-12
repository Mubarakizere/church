<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'position',
        'title',
        'bio',
        'description',
        'image',
        'email',
        'phone',
        'social_media',
        'is_active',
        'display_order',
        'category', // bishop, archdeacon, department
        'department_type', // for departments: daf, finance, hr, etc.
        'region', // for archdeacons: muhanga, kamonyi, etc.
        'icon', // for departments
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'social_media' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Scope to get bishop
     */
    public function scopeBishop($query)
    {
        return $query->where('category', 'bishop')->where('is_active', true);
    }

    /**
     * Scope to get archdeacons
     */
    public function scopeArchdeacons($query)
    {
        return $query->where('category', 'archdeacon')->where('is_active', true)->orderBy('display_order');
    }

    /**
     * Scope to get departments
     */
    public function scopeDepartments($query)
    {
        return $query->where('category', 'department')->where('is_active', true)->orderBy('display_order');
    }

    /**
     * Get team members by category
     */
    public static function getByCategory($category)
    {
        return self::where('category', $category)
                   ->where('is_active', true)
                   ->orderBy('display_order')
                   ->get();
    }

    /**
     * Get hierarchical team structure
     */
    public static function getHierarchicalStructure()
    {
        return [
            'bishop' => self::bishop()->first(),
            'archdeacons' => self::archdeacons()->get(),
            'departments' => self::departments()->get(),
        ];
    }
}
