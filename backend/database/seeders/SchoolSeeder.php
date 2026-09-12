<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;

class SchoolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        School::truncate();

        // ECD Schools (6)
        $ecdSchools = [
            [
                'name' => 'Kavumu ECD',
                'type' => 'ecd',
                'description' => 'Early Childhood Development center providing quality education for young children in Kavumu area.',
                'location' => 'Kavumu, Shyogwe Diocese',
                'programs_offered' => ['Pre-Primary Education', 'Child Development Programs', 'Nutritional Support'],
            ],
            [
                'name' => 'Gasharu ECD',
                'type' => 'ecd',
                'description' => 'Community-based ECD center focusing on holistic child development in Gasharu.',
                'location' => 'Gasharu, Shyogwe Diocese',
                'programs_offered' => ['Early Learning', 'Play-based Education', 'Parent Education'],
            ],
            [
                'name' => 'Sholi ECD',
                'type' => 'ecd',
                'description' => 'Rural ECD center providing foundational education for young learners in Sholi.',
                'location' => 'Sholi, Shyogwe Diocese',
                'programs_offered' => ['Pre-School Education', 'Child Care Services', 'Health Monitoring'],
            ],
            [
                'name' => 'Gitarama ECD',
                'type' => 'ecd',
                'description' => 'Community ECD center serving the Gitarama area.',
                'location' => 'Gitarama, Shyogwe Diocese',
                'programs_offered' => ['Early Childhood Education', 'Developmental Activities', 'Family Support'],
            ],
            [
                'name' => 'Runda ECD',
                'type' => 'ecd',
                'description' => 'ECD center providing quality early education in Runda area.',
                'location' => 'Runda, Shyogwe Diocese',
                'programs_offered' => ['Pre-Primary Learning', 'Social Development', 'Basic Skills'],
            ],
            [
                'name' => 'Munazi ECD',
                'type' => 'ecd',
                'description' => 'Community-based ECD center focusing on child development in Munazi.',
                'location' => 'Munazi, Shyogwe Diocese',
                'programs_offered' => ['Early Learning Programs', 'Child Development', 'Community Engagement'],
            ],
        ];

        // Primary Schools (9)
        $primarySchools = [
            [
                'name' => 'EP Muhazi',
                'type' => 'primary',
                'description' => 'Primary school providing quality basic education under the leadership of Munyambonera Theoneste.',
                'location' => 'Muhazi, Shyogwe Diocese',
                'head_teacher' => 'Munyambonera Theoneste',
                'programs_offered' => ['Primary Education (P1-P6)', 'English & Kinyarwanda', 'Mathematics', 'Science', 'Social Studies'],
            ],
            [
                'name' => 'EP Gisura',
                'type' => 'primary',
                'description' => 'Community primary school serving local children under Ngango Viateur.',
                'location' => 'Gisura, Shyogwe Diocese',
                'head_teacher' => 'Ngango Viateur',
                'programs_offered' => ['Basic Primary Education', 'Literacy Programs', 'Numeracy Skills'],
            ],
            [
                'name' => 'EP Rubyinoro',
                'type' => 'primary',
                'description' => 'Rural primary school providing foundational education led by Ndoriyobijya Azarias.',
                'location' => 'Rubyinoro, Shyogwe Diocese',
                'head_teacher' => 'Ndoriyobijya Azarias',
                'programs_offered' => ['Primary Curriculum', 'Life Skills', 'Environmental Education'],
            ],
            [
                'name' => 'EP Gishali',
                'type' => 'primary',
                'description' => 'Community primary school with focus on quality education under Dusengimana Justin.',
                'location' => 'Gishali, Shyogwe Diocese',
                'head_teacher' => 'Dusengimana Justin',
                'programs_offered' => ['Primary Education', 'Computer Literacy', 'Sports & Arts'],
            ],
            [
                'name' => 'EP Mpemba',
                'type' => 'primary',
                'description' => 'Primary school serving rural communities led by Rev. Munyaburanga Innocent.',
                'location' => 'Mpemba, Shyogwe Diocese',
                'head_teacher' => 'Rev. Munyaburanga Innocent',
                'programs_offered' => ['Basic Education', 'Religious Studies', 'Health Education'],
            ],
            [
                'name' => 'ZEC',
                'type' => 'primary',
                'description' => 'Community primary school with modern facilities under Dushimirimana Jonas.',
                'location' => 'Shyogwe Diocese',
                'head_teacher' => 'Dushimirimana Jonas',
                'programs_offered' => ['Primary Curriculum', 'ICT Skills', 'Creative Arts'],
            ],
            [
                'name' => 'EP Rugendabali',
                'type' => 'primary',
                'description' => 'Primary school providing quality basic education led by Rev. Dukuzumuremyi Gad.',
                'location' => 'Rugendabali, Shyogwe Diocese',
                'head_teacher' => 'Rev. Dukuzumuremyi Gad',
                'programs_offered' => ['Primary Education', 'Language Skills', 'Mathematics'],
            ],
            [
                'name' => 'EP Ntungamo',
                'type' => 'primary',
                'description' => 'Community primary school with dedicated teachers under Rev. Ndagijimana J. d\'Amour.',
                'location' => 'Ntungamo, Shyogwe Diocese',
                'head_teacher' => 'Rev. Ndagijimana J. d\'Amour',
                'programs_offered' => ['Basic Primary Education', 'Science Education', 'Social Skills'],
            ],
            [
                'name' => 'EP Nyakabungo',
                'type' => 'primary',
                'description' => 'Primary school serving the community under Kayitete M. Claire.',
                'location' => 'Nyakabungo, Shyogwe Diocese',
                'head_teacher' => 'Kayitete M. Claire',
                'programs_offered' => ['Primary Curriculum', 'Cultural Studies', 'Physical Education'],
            ],
        ];

        // Create base data for all schools
        $baseYear = 2000;
        $phoneBase = 100;
        
        foreach ($ecdSchools as $index => $school) {
            School::create(array_merge($school, [
                'contact_phone' => '+250 788 ' . (300000 + $phoneBase + $index),
                'contact_email' => strtolower(str_replace(' ', '.', $school['name'])) . '@shyogwe.org',
                'image' => '/placeholder.svg',
                'founded_year' => $baseYear + $index,
                'is_active' => true,
            ]));
        }

        foreach ($primarySchools as $index => $school) {
            School::create(array_merge($school, [
                'contact_phone' => '+250 788 ' . (400000 + $phoneBase + $index),
                'contact_email' => strtolower(str_replace(' ', '.', $school['name'])) . '@shyogwe.org',
                'image' => '/placeholder.svg',
                'founded_year' => $baseYear + $index + 5,
                'is_active' => true,
            ]));
        }

        // Day Schools (Secondary Schools) - 15 schools
        $daySchools = [
            ['name' => 'GS Nyabinoni', 'head_teacher' => 'Mwumvaneza J. dela Croix', 'location' => 'Nyabinoni'],
            ['name' => 'GS Murehe B', 'head_teacher' => 'Munyazikwiye Faustin', 'location' => 'Murehe B'],
            ['name' => 'GS Shaki', 'head_teacher' => 'Munyambonera Vincent', 'location' => 'Shaki'],
            ['name' => 'GS Ntenyo', 'head_teacher' => 'Niyirera Benjamin', 'location' => 'Ntenyo'],
            ['name' => 'GS Nyamagana', 'head_teacher' => 'Nikomeze Mediatrice', 'location' => 'Nyamagana'],
            ['name' => 'GS St Etienne', 'head_teacher' => 'Bisangimana Adolphe', 'location' => 'St Etienne'],
            ['name' => 'GS Gahombo A', 'head_teacher' => 'Rev. Nshumbusho Aimable', 'location' => 'Gahombo A'],
            ['name' => 'GS Gikokero', 'head_teacher' => 'Nyirabaruta Laurence', 'location' => 'Gikokero'],
            ['name' => 'GS Nyagisozi', 'head_teacher' => 'Bakarere Kezzie', 'location' => 'Nyagisozi'],
            ['name' => 'GS Cyimana', 'head_teacher' => 'Mbonankira Joel', 'location' => 'Cyimana'],
            ['name' => 'GS Gahengeri', 'head_teacher' => 'Rev. Nshimyumukiza Olivier', 'location' => 'Gahengeri'],
            ['name' => 'GS Hanika', 'head_teacher' => 'Mugiraneza Oswald', 'location' => 'Hanika'],
            ['name' => 'GS Nyarutovu', 'head_teacher' => 'Rev. Kabayiza Louis', 'location' => 'Nyarutovu'],
            ['name' => 'GS Nyarugenge', 'head_teacher' => 'Nsanzimana J. Bosco', 'location' => 'Nyarugenge'],
            ['name' => 'GS Kabuga K', 'head_teacher' => 'Muhawenimana Faith', 'location' => 'Kabuga K'],
        ];

        foreach ($daySchools as $index => $school) {
            School::create([
                'name' => $school['name'],
                'type' => 'secondary_basic',
                'description' => "Day secondary school providing Nine and Twelve Years Basic Education under the leadership of {$school['head_teacher']}.",
                'location' => $school['location'] . ', Shyogwe Diocese',
                'head_teacher' => $school['head_teacher'],
                'contact_phone' => '+250 788 ' . (500000 + $phoneBase + $index),
                'contact_email' => strtolower(str_replace(['GS ', ' '], ['', '.'], $school['name'])) . '@shyogwe.org',
                'image' => '/placeholder.svg',
                'founded_year' => $baseYear + $index + 10,
                'programs_offered' => ['O-Level Education', 'A-Level Education', 'Science & Mathematics', 'Languages', 'Social Studies'],
                'is_active' => true,
            ]);
        }

        // Boarding Schools - All types combined (8 schools total)
        $boardingSchools = [
            // General Education Boarding Schools (2)
            [
                'name' => 'GS Shyogwe',
                'type' => 'secondary_boarding',
                'head_teacher' => 'Nyabyenda Paul',
                'description' => 'Premier boarding school providing excellent general education with Christian values.',
                'location' => 'Shyogwe',
                'programs_offered' => ['General Secondary Education', 'Boarding Facilities', 'Extracurricular Activities', 'Leadership Development'],
            ],
            [
                'name' => 'TTC Muhanga',
                'type' => 'secondary_boarding',
                'head_teacher' => 'Mukabatesi Jeanne d\'Arc',
                'description' => 'Teacher Training College providing quality education for future educators.',
                'location' => 'Muhanga',
                'programs_offered' => ['Teacher Training', 'Educational Leadership', 'Pedagogy', 'Professional Development'],
            ],
            // TSS Technical and Vocational Education Boarding Schools (6)
            [
                'name' => 'MYTEC',
                'type' => 'tss_boarding',
                'head_teacher' => 'Rev. Niyomugaba Felecien',
                'description' => 'Technical and Vocational Education boarding school providing practical skills training.',
                'location' => 'Shyogwe Diocese',
                'programs_offered' => ['Technical Education', 'Vocational Training', 'Practical Skills', 'Industry Partnerships'],
            ],
            [
                'name' => 'Kanyinya TVET',
                'type' => 'tss_boarding',
                'head_teacher' => 'Habanabashaka Simon',
                'description' => 'Technical and Vocational Education Training center focusing on practical skills.',
                'location' => 'Kanyinya',
                'programs_offered' => ['Vocational Training', 'Technical Skills', 'Job Placement', 'Entrepreneurship'],
            ],
            [
                'name' => 'St Peter College',
                'type' => 'tss_boarding',
                'head_teacher' => 'Habumuremyi Evariste',
                'description' => 'College providing comprehensive technical and vocational education.',
                'location' => 'Shyogwe Diocese',
                'programs_offered' => ['Technical Education', 'Professional Training', 'Skills Development', 'Career Preparation'],
            ],
            [
                'name' => 'Hanika TSS',
                'type' => 'tss_boarding',
                'head_teacher' => 'Ngiruwonsanga Deogratias',
                'description' => 'Technical Secondary School providing specialized vocational training.',
                'location' => 'Hanika',
                'programs_offered' => ['Technical Skills', 'Vocational Education', 'Practical Training', 'Industry Connections'],
            ],
            [
                'name' => 'HAIP',
                'type' => 'tss_boarding',
                'head_teacher' => 'Biroli Gaetan',
                'description' => 'Higher Agricultural Institute providing specialized agricultural education.',
                'location' => 'Shyogwe Diocese',
                'programs_offered' => ['Agricultural Sciences', 'Farming Techniques', 'Agribusiness', 'Rural Development'],
            ],
            [
                'name' => 'Vunga VTC',
                'type' => 'tss_boarding',
                'head_teacher' => 'Abayisenga Dieudonne',
                'description' => 'Vocational Training Center providing practical skills for employment.',
                'location' => 'Vunga',
                'programs_offered' => ['Vocational Training', 'Skills Development', 'Job Preparation', 'Entrepreneurship'],
            ],
        ];

        foreach ($boardingSchools as $index => $school) {
            School::create([
                'name' => $school['name'],
                'type' => $school['type'],
                'description' => $school['description'],
                'location' => $school['location'] . ', Shyogwe Diocese',
                'head_teacher' => $school['head_teacher'],
                'contact_phone' => '+250 788 ' . (600000 + $phoneBase + $index),
                'contact_email' => strtolower(str_replace([' ', '\''], ['.', ''], $school['name'])) . '@shyogwe.org',
                'image' => '/placeholder.svg',
                'founded_year' => $baseYear + $index + 15,
                'programs_offered' => $school['programs_offered'],
                'is_active' => true,
            ]);
        }

        // University (1)
        School::create([
            'name' => 'Shyogwe Anglican University',
            'type' => 'university',
            'description' => 'Premier university offering undergraduate and graduate programs with Christian foundation.',
            'location' => 'Shyogwe, Muhanga District',
            'head_teacher' => 'Vice-Chancellor (To be appointed)',
            'contact_phone' => '+250 788 800001',
            'contact_email' => 'info@sau.ac.rw',
            'image' => '/placeholder.svg',
            'founded_year' => 2010,
            'programs_offered' => [
                'Theology and Religious Studies',
                'Education',
                'Business Administration',
                'Information Technology',
                'Development Studies',
                'Health Sciences',
                'Agriculture',
                'Social Work'
            ],
            'is_active' => true,
        ]);
    }
}
