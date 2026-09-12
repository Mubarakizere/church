<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Program;
use Carbon\Carbon;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        Program::create([
            'title' => 'Family Life & Gender - Parenting Support',
            'description' => 'Support sessions for parents focusing on positive parenting, family counselling and relationship strengthening.',
            'category' => 'family_life',
            'location' => 'Community Hall',
            'attendees' => 'Families',
            'featured' => false,
            'is_active' => true,
            'start_date' => Carbon::now()->addDays(7)->toDateString(),
            'recurrence_pattern' => 'monthly',
        ]);

        Program::create([
            'title' => 'Women Union',
            'description' => 'Gathering for women to share fellowship, training and economic empowerment.',
            'category' => 'women_union',
            'location' => 'Parish Church',
            'attendees' => 'Women',
            'is_active' => true,
            'recurrence_pattern' => 'monthly',
        ]);

        Program::create([
            'title' => 'Youth Reunion',
            'description' => 'Youth engagement program focusing on leadership and life skills.',
            'category' => 'youth',
            'location' => 'Youth Center',
            'attendees' => 'Youth',
            'is_active' => true,
            'recurrence_pattern' => 'monthly',
        ]);
    }
}

