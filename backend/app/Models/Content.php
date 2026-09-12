<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Content extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'title',
        'content',
        'type',
        'page',
        'section',
        'meta_data',
        'is_active',
        'display_order',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'meta_data' => 'array',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Get content by page and section
     */
    public static function getByPageSection($page, $section = null)
    {
        $query = self::where('page', $page)
                    ->where('is_active', true)
                    ->orderBy('display_order');

        if ($section) {
            $query->where('section', $section);
        }

        return $query->get();
    }

    /**
     * Get content by key
     */
    public static function getByKey($key)
    {
        return self::where('key', $key)
                  ->where('is_active', true)
                  ->first();
    }

    /**
     * Get editable content areas
     */
    public static function getEditableAreas()
    {
        return [
            'home' => [
                'hero_title' => 'Hero Section Title',
                'hero_subtitle' => 'Hero Section Subtitle',
                'about_title' => 'About Section Title',
                'about_content' => 'About Section Content',
                'services_title' => 'Services Section Title',
                'events_title' => 'Events Section Title',
            ],
            'about' => [
                'page_title' => 'Page Title',
                'page_subtitle' => 'Page Subtitle',
                'mission_title' => 'Mission Title',
                'mission_content' => 'Mission Content',
                'vision_title' => 'Vision Title',
                'vision_content' => 'Vision Content',
                'values_title' => 'Values Title',
                'values_content' => 'Values Content',
            ],
            'services' => [
                'page_title' => 'Page Title',
                'page_subtitle' => 'Page Subtitle',
                'morning_service_title' => 'Morning Service Title',
                'morning_service_content' => 'Morning Service Content',
                'evening_service_title' => 'Evening Service Title',
                'evening_service_content' => 'Evening Service Content',
            ],
            'contact' => [
                'page_title' => 'Page Title',
                'page_subtitle' => 'Page Subtitle',
                'address' => 'Physical Address',
                'phone' => 'Phone Number',
                'email' => 'Email Address',
                'office_hours' => 'Office Hours',
            ],
        ];
    }

    /**
     * Content types
     */
    public static function getContentTypes()
    {
        return [
            'text' => 'Plain Text',
            'html' => 'Rich Text/HTML',
            'image' => 'Image',
            'video' => 'Video',
            'file' => 'File/Document',
            'json' => 'Structured Data',
        ];
    }
}
