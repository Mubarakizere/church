<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HealthCenter;

class HealthCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        HealthCenter::truncate();

        $healthCenters = [
            [
                'name' => 'Shyogwe Health Center',
                'description' => 'Main health center providing comprehensive medical services to the Shyogwe community and surrounding areas.',
                'location' => 'Shyogwe, Muhanga District',
                'contact_phone' => '+250 788 100 001',
                'contact_email' => 'shyogwe.hc@shyogwe.org',
                'image' => '/placeholder.svg',
                'services' => [
                    'General Medicine',
                    'Maternal and Child Health',
                    'Laboratory Services',
                    'Pharmacy',
                    'Emergency Care',
                    'Vaccination Programs',
                    'HIV/AIDS Testing and Treatment',
                    'Family Planning'
                ],
                'operating_hours' => 'Monday - Friday: 7:00 AM - 5:00 PM, Saturday: 8:00 AM - 12:00 PM, Sunday: Emergency only',
                'is_active' => true,
            ],
            [
                'name' => 'Hanika Health Center',
                'description' => 'Community health center serving the Hanika area with quality healthcare services and health education programs.',
                'location' => 'Hanika, Muhanga District',
                'contact_phone' => '+250 788 100 002',
                'contact_email' => 'hanika.hc@shyogwe.org',
                'image' => '/placeholder.svg',
                'services' => [
                    'General Medicine',
                    'Maternal Health Services',
                    'Child Health Care',
                    'Laboratory Services',
                    'Pharmacy',
                    'Immunization',
                    'Health Education',
                    'Nutrition Programs'
                ],
                'operating_hours' => 'Monday - Friday: 7:30 AM - 4:30 PM, Saturday: 8:00 AM - 12:00 PM',
                'is_active' => true,
            ],
            [
                'name' => 'Gikomero Health Center',
                'description' => 'Rural health center providing essential healthcare services to the Gikomero community and neighboring villages.',
                'location' => 'Gikomero, Muhanga District',
                'contact_phone' => '+250 788 100 003',
                'contact_email' => 'gikomero.hc@shyogwe.org',
                'image' => '/placeholder.svg',
                'services' => [
                    'Primary Healthcare',
                    'Maternal and Child Health',
                    'Basic Laboratory Services',
                    'Pharmacy Services',
                    'Preventive Care',
                    'Health Promotion',
                    'Community Outreach',
                    'Chronic Disease Management'
                ],
                'operating_hours' => 'Monday - Friday: 8:00 AM - 4:00 PM, Saturday: 8:00 AM - 12:00 PM',
                'is_active' => true,
            ],
        ];

        foreach ($healthCenters as $center) {
            HealthCenter::create($center);
        }
    }
}
