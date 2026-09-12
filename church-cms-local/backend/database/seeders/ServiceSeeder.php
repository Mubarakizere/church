<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'title' => 'English Service',
                'time' => '6:30 AM - 8:30 AM',
                'type' => 'Holy Communion in English',
                'description' => 'Early morning Anglican service conducted entirely in English. Traditional liturgy with Holy Communion, perfect for English-speaking congregation members.',
                'features' => ['English Liturgy', 'Holy Communion', 'Traditional Hymns', 'Morning Prayer'],
                'language' => 'english',
                'is_active' => true,
                'display_order' => 1
            ],
            [
                'title' => 'Kinyarwanda Service',
                'time' => '9:00 AM - 12:00 PM',
                'type' => 'Holy Communion in Kinyarwanda',
                'description' => 'Main morning service conducted in Kinyarwanda, our local language. Full Anglican liturgy with Holy Communion, designed for the local community.',
                'features' => ['Kinyarwanda Liturgy', 'Holy Communion', 'Local Hymns', 'Community Fellowship'],
                'language' => 'kinyarwanda',
                'is_active' => true,
                'display_order' => 2
            ],
            [
                'title' => 'Mixed Service',
                'time' => '3:30 PM - 5:30 PM',
                'type' => 'Bilingual Worship',
                'description' => 'Afternoon service combining both English and Kinyarwanda. A unique worship experience that brings together our diverse congregation in unity.',
                'features' => ['Bilingual Worship', 'Mixed Congregation', 'Contemporary & Traditional', 'Unity in Diversity'],
                'language' => 'mixed',
                'is_active' => true,
                'display_order' => 3
            ]
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
