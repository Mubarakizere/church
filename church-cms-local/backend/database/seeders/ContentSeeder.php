<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Content;

class ContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing content
        Content::truncate();

        $contents = [
            // Home Page Content
            [
                'key' => 'home_hero_title',
                'title' => 'Hero Title',
                'content' => 'Welcome to Anglican Church of Rwanda, Shyogwe Diocese',
                'type' => 'text',
                'page' => 'home',
                'section' => 'hero',
                'display_order' => 1,
            ],
            [
                'key' => 'home_hero_subtitle',
                'title' => 'Hero Subtitle',
                'content' => 'Serving our communities with faith, hope, and love through education, healthcare, and spiritual guidance.',
                'type' => 'text',
                'page' => 'home',
                'section' => 'hero',
                'display_order' => 2,
            ],
            [
                'key' => 'home_about_title',
                'title' => 'About Section Title',
                'content' => 'About Our Church',
                'type' => 'text',
                'page' => 'home',
                'section' => 'about',
                'display_order' => 1,
            ],
            [
                'key' => 'home_about_content',
                'title' => 'About Section Content',
                'content' => 'The Anglican Church of Rwanda, Shyogwe Diocese, is a vibrant community of faith committed to spreading the Gospel of Jesus Christ and serving our communities through various ministries including education, healthcare, and community development.',
                'type' => 'html',
                'page' => 'home',
                'section' => 'about',
                'display_order' => 2,
            ],

            // About Page Content
            [
                'key' => 'about_page_title',
                'title' => 'About Page Title',
                'content' => 'About Our Church',
                'type' => 'text',
                'page' => 'about',
                'section' => 'header',
                'display_order' => 1,
            ],
            [
                'key' => 'about_page_subtitle',
                'title' => 'About Page Subtitle',
                'content' => 'Learn about our history, mission, and commitment to serving God and our community.',
                'type' => 'text',
                'page' => 'about',
                'section' => 'header',
                'display_order' => 2,
            ],
            [
                'key' => 'about_mission_title',
                'title' => 'Mission Title',
                'content' => 'Our Mission',
                'type' => 'text',
                'page' => 'about',
                'section' => 'mission',
                'display_order' => 1,
            ],
            [
                'key' => 'about_mission_content',
                'title' => 'Mission Content',
                'content' => 'To proclaim the Gospel of Jesus Christ, nurture believers in their faith journey, and serve our communities through education, healthcare, and social development programs.',
                'type' => 'html',
                'page' => 'about',
                'section' => 'mission',
                'display_order' => 2,
            ],
            [
                'key' => 'about_vision_title',
                'title' => 'Vision Title',
                'content' => 'Our Vision',
                'type' => 'text',
                'page' => 'about',
                'section' => 'vision',
                'display_order' => 1,
            ],
            [
                'key' => 'about_vision_content',
                'title' => 'Vision Content',
                'content' => 'To be a transformative church that brings hope, healing, and holistic development to all people in Rwanda and beyond.',
                'type' => 'html',
                'page' => 'about',
                'section' => 'vision',
                'display_order' => 2,
            ],

            // Services Page Content
            [
                'key' => 'services_page_title',
                'title' => 'Services Page Title',
                'content' => 'Worship Services',
                'type' => 'text',
                'page' => 'services',
                'section' => 'header',
                'display_order' => 1,
            ],
            [
                'key' => 'services_page_subtitle',
                'title' => 'Services Page Subtitle',
                'content' => 'Join us for worship in English, Kinyarwanda, or our mixed service. All are welcome!',
                'type' => 'text',
                'page' => 'services',
                'section' => 'header',
                'display_order' => 2,
            ],
            [
                'key' => 'services_english_time',
                'title' => 'English Service Time',
                'content' => '6:30 AM - 8:30 AM',
                'type' => 'text',
                'page' => 'services',
                'section' => 'times',
                'display_order' => 1,
            ],
            [
                'key' => 'services_kinyarwanda_time',
                'title' => 'Kinyarwanda Service Time',
                'content' => '9:00 AM - 12:00 PM',
                'type' => 'text',
                'page' => 'services',
                'section' => 'times',
                'display_order' => 2,
            ],
            [
                'key' => 'services_mixed_time',
                'title' => 'Mixed Service Time',
                'content' => '3:30 PM - 5:30 PM',
                'type' => 'text',
                'page' => 'services',
                'section' => 'times',
                'display_order' => 3,
            ],

            // Contact Page Content
            [
                'key' => 'contact_page_title',
                'title' => 'Contact Page Title',
                'content' => 'Contact Us',
                'type' => 'text',
                'page' => 'contact',
                'section' => 'header',
                'display_order' => 1,
            ],
            [
                'key' => 'contact_page_subtitle',
                'title' => 'Contact Page Subtitle',
                'content' => 'Get in touch with us. We would love to hear from you and answer any questions you may have.',
                'type' => 'text',
                'page' => 'contact',
                'section' => 'header',
                'display_order' => 2,
            ],
            [
                'key' => 'contact_address',
                'title' => 'Physical Address',
                'content' => 'Shyogwe Diocese, Muhanga District, Southern Province, Rwanda',
                'type' => 'text',
                'page' => 'contact',
                'section' => 'info',
                'display_order' => 1,
            ],
            [
                'key' => 'contact_phone',
                'title' => 'Phone Number',
                'content' => '+250 788 100 001',
                'type' => 'text',
                'page' => 'contact',
                'section' => 'info',
                'display_order' => 2,
            ],
            [
                'key' => 'contact_email',
                'title' => 'Email Address',
                'content' => 'info@shyogwe.org',
                'type' => 'text',
                'page' => 'contact',
                'section' => 'info',
                'display_order' => 3,
            ],
            [
                'key' => 'contact_office_hours',
                'title' => 'Office Hours',
                'content' => 'Monday - Friday: 8:00 AM - 5:00 PM<br>Saturday: 9:00 AM - 1:00 PM<br>Sunday: After Service',
                'type' => 'html',
                'page' => 'contact',
                'section' => 'info',
                'display_order' => 4,
            ],

            // Footer Content
            [
                'key' => 'footer_description',
                'title' => 'Footer Description',
                'content' => 'Anglican Church of Rwanda, Shyogwe Diocese - Serving our communities with faith, hope, and love.',
                'type' => 'text',
                'page' => 'global',
                'section' => 'footer',
                'display_order' => 1,
            ],
            [
                'key' => 'footer_copyright',
                'title' => 'Footer Copyright',
                'content' => '© 2024 Anglican Church of Rwanda, Shyogwe Diocese. All rights reserved.',
                'type' => 'text',
                'page' => 'global',
                'section' => 'footer',
                'display_order' => 2,
            ],
        ];

        foreach ($contents as $content) {
            Content::create(array_merge($content, [
                'is_active' => true,
                'created_by' => 1, // Assuming admin user ID is 1
                'updated_by' => 1,
            ]));
        }

        $this->command->info('Content seeded successfully!');
        $this->command->info('Created ' . count($contents) . ' content items');
    }
}
