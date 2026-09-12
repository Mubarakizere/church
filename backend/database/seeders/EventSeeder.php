<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = [
            [
                'title' => 'Christmas Carol Service',
                'description' => 'Join us for a beautiful evening of Christmas carols and worship.',
                'date' => Carbon::parse('2024-12-24'),
                'time' => '19:00:00',
                'location' => 'St. Matthew\'s Anglican Church',
                'status' => 'upcoming',
                'attendees' => 'All Welcome',
                'featured' => true,
                'is_recurring' => false,
            ],
            [
                'title' => 'New Year Prayer Service',
                'description' => 'Start the new year with prayer and thanksgiving.',
                'date' => Carbon::parse('2025-01-01'),
                'time' => '10:00:00',
                'location' => 'St. Matthew\'s Anglican Church',
                'status' => 'upcoming',
                'attendees' => 'All Welcome',
                'featured' => true,
                'is_recurring' => false,
            ],
            [
                'title' => 'Weekly Bible Study',
                'description' => 'Join us for weekly Bible study and fellowship.',
                'date' => Carbon::parse('2024-12-15'),
                'time' => '18:00:00',
                'location' => 'Church Hall',
                'status' => 'upcoming',
                'attendees' => 'All Welcome',
                'featured' => false,
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
            ],
            [
                'title' => 'Youth Group Meeting',
                'description' => 'Weekly meeting for our youth members.',
                'date' => Carbon::parse('2024-12-22'),
                'time' => '15:00:00',
                'location' => 'Youth Center',
                'status' => 'upcoming',
                'attendees' => 'Youth Members',
                'featured' => false,
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
            ],
            [
                'title' => 'Community Outreach',
                'description' => 'Monthly community service and outreach program.',
                'date' => Carbon::parse('2024-12-28'),
                'time' => '09:00:00',
                'location' => 'Community Center',
                'status' => 'upcoming',
                'attendees' => 'Volunteers',
                'featured' => false,
                'is_recurring' => true,
                'recurrence_pattern' => 'monthly',
            ],
            // Family Life & Gender Programs
            [
                'title' => 'Family Life & Gender - Parenting Support',
                'description' => 'Monthly support sessions for parents focusing on positive parenting, family counselling, and strengthening family relationships.',
                'date' => Carbon::now()->addWeeks(1),
                'time' => '10:00:00',
                'location' => 'Community Hall',
                'status' => 'upcoming',
                'attendees' => 'Families',
                'featured' => false,
                'is_recurring' => true,
                'recurrence_pattern' => 'monthly',
            ],
            [
                'title' => 'Women Union',
                'description' => 'Gathering for women to share fellowship, training, and economic empowerment activities.',
                'date' => Carbon::now()->addWeeks(2),
                'time' => '14:00:00',
                'location' => 'Parish Church',
                'status' => 'upcoming',
                'attendees' => "Women's Ministry",
                'featured' => false,
                'is_recurring' => true,
                'recurrence_pattern' => 'monthly',
            ],
            [
                'title' => 'Youth Reunion',
                'description' => 'Monthly youth reunion and engagement program focusing on leadership, mentorship, and life skills.',
                'date' => Carbon::now()->addWeeks(3),
                'time' => '19:00:00',
                'location' => 'Youth Center',
                'status' => 'upcoming',
                'attendees' => 'Youth',
                'featured' => false,
                'is_recurring' => true,
                'recurrence_pattern' => 'monthly',
            ],
        ];

        foreach ($events as $eventData) {
            Event::create($eventData);
        }
    }
}