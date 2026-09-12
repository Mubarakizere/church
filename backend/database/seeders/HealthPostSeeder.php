<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HealthPost;

class HealthPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        HealthPost::truncate();

        $healthPosts = [
            [
                'name' => 'Mbayaya Health Post',
                'description' => 'Community-based health post providing primary healthcare services and health education to the Mbayaya community.',
                'location' => 'Mbayaya, Muhanga District',
                'contact_phone' => '+250 788 200 001',
                'contact_email' => 'mbayaya.hp@shyogwe.org',
                'image' => '/placeholder.svg',
                'services' => [
                    'Basic Primary Care',
                    'First Aid Services',
                    'Health Education',
                    'Immunization',
                    'Growth Monitoring',
                    'Family Planning Counseling',
                    'Community Health Promotion',
                    'Referral Services'
                ],
                'operating_hours' => 'Monday - Friday: 8:00 AM - 3:00 PM',
                'is_active' => true,
            ],
            [
                'name' => 'Shyogwe Health Post',
                'description' => 'Local health post serving the Shyogwe community with basic healthcare services and health promotion activities.',
                'location' => 'Shyogwe, Muhanga District',
                'contact_phone' => '+250 788 200 002',
                'contact_email' => 'shyogwe.hp@shyogwe.org',
                'image' => '/placeholder.svg',
                'services' => [
                    'Primary Healthcare',
                    'Maternal Health Support',
                    'Child Health Services',
                    'Health Education',
                    'Disease Prevention',
                    'Community Outreach',
                    'Basic Treatment',
                    'Health Screening'
                ],
                'operating_hours' => 'Monday - Friday: 8:00 AM - 3:00 PM, Saturday: 9:00 AM - 12:00 PM',
                'is_active' => true,
            ],
            [
                'name' => 'Nyamagana Health Post',
                'description' => 'Rural health post providing essential primary healthcare services to the Nyamagana community and surrounding areas.',
                'location' => 'Nyamagana, Muhanga District',
                'contact_phone' => '+250 788 200 003',
                'contact_email' => 'nyamagana.hp@shyogwe.org',
                'image' => '/placeholder.svg',
                'services' => [
                    'Basic Healthcare Services',
                    'Health Education',
                    'Preventive Care',
                    'Immunization Services',
                    'Nutrition Counseling',
                    'Community Health Programs',
                    'First Aid Treatment',
                    'Health Promotion'
                ],
                'operating_hours' => 'Monday - Friday: 8:30 AM - 3:30 PM',
                'is_active' => true,
            ],
            [
                'name' => 'Kibinja Health Post',
                'description' => 'Community health post delivering primary healthcare services and health education to the Kibinja area residents.',
                'location' => 'Kibinja, Muhanga District',
                'contact_phone' => '+250 788 200 004',
                'contact_email' => 'kibinja.hp@shyogwe.org',
                'image' => '/placeholder.svg',
                'services' => [
                    'Primary Care Services',
                    'Health Education',
                    'Maternal Health Support',
                    'Child Health Care',
                    'Disease Prevention',
                    'Community Health Outreach',
                    'Basic Medical Treatment',
                    'Health Awareness Programs'
                ],
                'operating_hours' => 'Monday - Friday: 8:00 AM - 3:00 PM',
                'is_active' => true,
            ],
        ];

        foreach ($healthPosts as $post) {
            HealthPost::create($post);
        }
    }
}
