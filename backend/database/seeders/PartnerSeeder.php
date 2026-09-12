<?php

namespace Database\Seeders;

use App\Models\Partner;
use Illuminate\Database\Seeder;

class PartnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $partners = [
            [
                'name' => 'Grassroots Rwanda (UK)',
                'country' => 'United Kingdom',
                'type' => 'Development Partner',
                'description' => 'Supporting community development and grassroots initiatives in Rwanda.',
                'website' => 'https://grassrootsrwanda.org.uk',
                'email' => 'info@grassrootsrwanda.org.uk',
                'category' => 'development',
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'name' => 'Anglican Church Mission Society',
                'country' => 'United Kingdom',
                'type' => 'Mission Partner',
                'description' => 'Supporting Anglican mission work and church development in Rwanda.',
                'website' => 'https://churchmissionsociety.org',
                'email' => 'info@churchmissionsociety.org',
                'category' => 'mission',
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'name' => 'Diocese of London',
                'country' => 'United Kingdom',
                'type' => 'Sister Diocese',
                'description' => 'Partnership for mutual support and shared ministry between dioceses.',
                'website' => 'https://london.anglican.org',
                'email' => 'info@london.anglican.org',
                'category' => 'diocese',
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'name' => 'Christian Aid',
                'country' => 'United Kingdom',
                'type' => 'Development Partner',
                'description' => 'Working together to end poverty and injustice through faith-based action.',
                'website' => 'https://christianaid.org.uk',
                'email' => 'info@christianaid.org.uk',
                'category' => 'development',
                'is_active' => true,
                'display_order' => 4,
            ],
            [
                'name' => 'Tearfund',
                'country' => 'United Kingdom',
                'type' => 'Relief & Development',
                'description' => 'Partnering in disaster response and long-term community development.',
                'website' => 'https://tearfund.org',
                'email' => 'info@tearfund.org',
                'category' => 'relief',
                'is_active' => true,
                'display_order' => 5,
            ],
            [
                'name' => 'Rwanda Anglican Youth Association',
                'country' => 'Rwanda',
                'type' => 'Local Partner',
                'description' => 'Empowering young people in the Anglican community across Rwanda.',
                'website' => null,
                'email' => 'youth@anglican.rw',
                'category' => 'local',
                'is_active' => true,
                'display_order' => 6,
            ],
        ];

        foreach ($partners as $partnerData) {
            Partner::create($partnerData);
        }
    }
}
