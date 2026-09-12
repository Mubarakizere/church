<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ShyogweDataSeeder extends Seeder
{
    /**
     * Run the database seeds for Shyogwe Diocese data.
     */
    public function run(): void
    {
        $this->call([
            TeamHierarchySeeder::class,
            HealthCenterSeeder::class,
            HealthPostSeeder::class,
            SchoolSeeder::class,
        ]);

        $this->command->info('Shyogwe Diocese data seeded successfully!');
        $this->command->info('Data includes:');
        $this->command->info('- Hierarchical team structure (Bishop, 6 Archdeacons, 9 Departments)');
        $this->command->info('- 3 Health Centers (Shyogwe, Hanika, Gikomero)');
        $this->command->info('- 4 Health Posts (Mbayaya, Shyogwe, Nyamagana, Kibinja)');
        $this->command->info('- 6 ECD Schools');
        $this->command->info('- 9 Primary Schools');
        $this->command->info('- 15 Secondary Schools (Nine and Twelve Years Basic Education)');
        $this->command->info('- 2 Secondary Boarding Schools (General Education)');
        $this->command->info('- 6 TSS Secondary Boarding Schools (Technical and Vocational)');
        $this->command->info('- 1 University (Shyogwe Anglican University)');
    }
}
