<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HeroImage;

class HeroImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $heroImages = [
            [
                'src' => '/1.jpg',
                'title' => 'Welcome to Our Church',
                'subtitle' => 'A place of worship and community',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'src' => '/01.jpg',
                'title' => 'Join Our Congregation',
                'subtitle' => 'Experience fellowship and spiritual growth',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'src' => '/02.jpg',
                'title' => 'Sunday Services',
                'subtitle' => 'Come worship with us every Sunday',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'src' => '/03.jpg',
                'title' => 'Community Gathering',
                'subtitle' => 'Building relationships in faith',
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'src' => '/001.jpg',
                'title' => 'Anglican Tradition',
                'subtitle' => 'Rooted in faith, growing in love',
                'display_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($heroImages as $image) {
            HeroImage::create($image);
        }
    }
}
