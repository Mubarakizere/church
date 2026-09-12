<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Gallery;

class GallerySeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $images = [
            [
                'title' => 'Christmas Celebration 2024',
                'description' => 'Annual Christmas service at Shyogwe Cathedral with the community gathering for worship and fellowship.',
                'image_url' => '/images/gallery/christmas-2024.jpg',
                'category' => 'Events',
                'display_order' => 1,
                'is_active' => true
            ],
            [
                'title' => 'Youth Ministry Gathering',
                'description' => 'Youth fellowship meeting and activities, building strong Christian foundations for young people.',
                'image_url' => '/images/gallery/youth-gathering.jpg',
                'category' => 'Youth',
                'display_order' => 2,
                'is_active' => true
            ],
            [
                'title' => 'Community Outreach Program',
                'description' => 'Healthcare outreach program in rural areas, serving the community with love and compassion.',
                'image_url' => '/images/gallery/community-outreach.jpg',
                'category' => 'Community',
                'display_order' => 3,
                'is_active' => true
            ],
            [
                'title' => 'Easter Sunday Service',
                'description' => 'Celebrating the resurrection of Jesus Christ with our church family.',
                'image_url' => '/images/gallery/easter-service.jpg',
                'category' => 'Events',
                'display_order' => 4,
                'is_active' => true
            ],
            [
                'title' => 'Confirmation Class',
                'description' => 'Young people preparing for confirmation in the Anglican faith.',
                'image_url' => '/images/gallery/confirmation-class.jpg',
                'category' => 'Youth',
                'display_order' => 5,
                'is_active' => true
            ],
            [
                'title' => 'Women\'s Bible Study',
                'description' => 'Monthly Bible study and fellowship for women, studying the book of Proverbs.',
                'image_url' => '/images/gallery/womens-bible-study.jpg',
                'category' => 'Community',
                'display_order' => 6,
                'is_active' => true
            ],
            [
                'title' => 'Men\'s Prayer Breakfast',
                'description' => 'Monthly fellowship breakfast with prayer, Bible study, and discussion.',
                'image_url' => '/images/gallery/mens-breakfast.jpg',
                'category' => 'Community',
                'display_order' => 7,
                'is_active' => true
            ],
            [
                'title' => 'Sunday School',
                'description' => 'Children learning about God\'s love and the Bible through interactive lessons.',
                'image_url' => '/images/gallery/sunday-school.jpg',
                'category' => 'Youth',
                'display_order' => 8,
                'is_active' => true
            ]
        ];

        foreach ($images as $image) {
            Gallery::create($image);
        }
    }
}

