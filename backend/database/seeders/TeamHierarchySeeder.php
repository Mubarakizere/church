<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;

class TeamHierarchySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Available images for team members
        $availableImages = [
            '/1.jpg',
            '/01.jpg', 
            '/02.jpg',
            '/03.jpg',
            '/001.jpg'
        ];
        
        // Clear existing team data
        Team::truncate();

        // Bishop
        Team::create([
            'name' => 'Rt. Rev. Louis Pasteur KABAYIZA',
            'position' => 'Bishop',
            'title' => 'Bishop of The Diocese',
            'bio' => 'The Bishop provides spiritual leadership and pastoral care to clergy, laity, and institutions, ensuring faithfulness to Scripture and Anglican tradition. He oversees diocesan administration, clergy recruitment and training, and presides over confirmations and ordinations.',
            'description' => 'The Bishop provides spiritual leadership and pastoral care to clergy, laity, and institutions, ensuring faithfulness to Scripture and Anglican tradition. He oversees diocesan administration, clergy recruitment and training, and presides over confirmations and ordinations. The Bishop promotes evangelism, discipleship, and mission, represents the diocese nationally and internationally, and fosters unity and partnerships. He also advocates for peace, reconciliation, social justice, and leads the church\'s response to community needs while nurturing spiritual growth through teaching and pastoral guidance.',
            'image' => $availableImages[0], // Use first available image for bishop
            'email' => 'bishop@earshyogwe.com',
            'phone' => '+250785451691',
            'category' => 'bishop',
            'is_active' => true,
            'display_order' => 1,
        ]);

        // Archdeacons with real phone numbers
        $archdeacons = [
            [
                'name' => 'Arch. SIKUBWABO Jerome',
                'title' => 'Archdeacon of Shyogwe and Head of Evangelism Department',
                'region' => 'shyogwe',
                'description' => 'The Archdeaconry is responsible for implementing decisions from higher church organs, reviewing parish reports, and overseeing the management and spiritual life of church-affiliated schools.',
                'email' => 'shyogwe@shyogwe.org',
                'phone' => '+250785761119',
            ],
            [
                'name' => 'Arch. NTAKIRUTIMANA Venant',
                'title' => 'Archdeacon of Gitarama',
                'region' => 'gitarama',
                'description' => 'Overseeing parishes in the Gitarama region with dedication and service.',
                'email' => 'gitarama@shyogwe.org',
                'phone' => '+250780783617361',
            ],
            [
                'name' => 'Arch. SEHORANA Joseph',
                'title' => 'Archdeacon of Hanika',
                'region' => 'hanika',
                'description' => 'Leading ministry and pastoral care in the Hanika area.',
                'email' => 'hanika@shyogwe.org',
                'phone' => '+250788730061',
            ],
            [
                'name' => 'Arch. HATEGEKIMANA Joseph',
                'title' => 'Archdeacon of Nyamagana',
                'region' => 'nyamagana',
                'description' => 'Providing spiritual leadership in the Nyamagana region.',
                'email' => 'nyamagana@shyogwe.org',
                'phone' => '+250788523382',
            ],
            [
                'name' => 'Arch. NZAKAMARWANIKI Mathias',
                'title' => 'Archdeacon of Ndiza',
                'region' => 'ndiza',
                'description' => 'Overseeing church activities and growth in Ndiza district.',
                'email' => 'ndiza@shyogwe.org',
                'phone' => '+250788809204',
            ],
        ];

        foreach ($archdeacons as $index => $archdeacon) {
            Team::create(array_merge($archdeacon, [
                'position' => 'Archdeacon',
                'bio' => $archdeacon['description'],
                'image' => $availableImages[($index % count($availableImages)) + 1] ?? '/placeholder.svg',
                'category' => 'archdeacon',
                'is_active' => true,
                'display_order' => $index + 2,
            ]));
        }

        // Departments with real phone numbers
        $departments = [
            [
                'name' => 'NTABANGANYIMANA Concorde',
                'title' => 'Accountant',
                'department_type' => 'accountant',
                'description' => 'The Accountant, supervised by the Executive Administrative Officer, manages the Diocese\'s financial operations, including payment orders, checks, payroll, and compliance with donor and organizational guidelines.',
                'email' => 'accountant@shyogwe.org',
                'phone' => '+250728513211',
                'icon' => 'Building',
            ],
            [
                'name' => 'NSABIMANA Leonard',
                'title' => 'Head of Development Department',
                'department_type' => 'development',
                'description' => 'The Development Department of EAR Shyogwe Diocese addresses challenges affecting the well-being of communities within the Diocese\'s districts by designing and implementing solutions for sustainable development.',
                'email' => 'development@shyogwe.org',
                'phone' => '+250783091342',
                'icon' => 'Building',
            ],
            [
                'name' => 'DUSHIMIMANA Clementine',
                'title' => 'Head of Family Life Department',
                'department_type' => 'family',
                'description' => 'The Department of Family Life in the Anglican Church of Rwanda, Shyogwe Diocese, encompasses all family members, including Mothers\' Fellowship, Fathers\' Fellowship, Youth Fellowship, and Children\'s Fellowship.',
                'email' => 'family@shyogwe.org',
                'phone' => '+250786943184',
                'icon' => 'Home',
            ],
            [
                'name' => 'MUKAMUSONI Solange',
                'title' => 'Human Resource Management',
                'department_type' => 'hr',
                'description' => 'The Human Resources Officer is responsible for managing the full employee lifecycle, including recruitment, appointment, and induction of new staff.',
                'email' => 'hr@shyogwe.org',
                'phone' => '+250783788981',
                'icon' => 'Users',
            ],
            [
                'name' => 'BIZIMANA Emmanuel',
                'title' => 'Diocesan Technician',
                'department_type' => 'technical',
                'description' => 'The Diocesan Technician is responsible for the maintenance and proper functioning of machinery and solar power systems within the Diocese.',
                'email' => 'technical@shyogwe.org',
                'phone' => '+250788271429',
                'icon' => 'Wrench',
            ],
            [
                'name' => 'BAHIZI Pierre',
                'title' => 'Cashier',
                'department_type' => 'cashier',
                'description' => 'The Cashier is responsible for managing petty cash, performing cash payments, and ensuring that all transactions are properly supported and documented.',
                'email' => 'cashier@shyogwe.org',
                'phone' => '+250784023308',
                'icon' => 'Building',
            ],
            [
                'name' => 'SAFARI Eric',
                'title' => 'Head of Education Department',
                'department_type' => 'education',
                'description' => 'The Head of the Department of Education and Youth oversees programs for education, youth, and children\'s welfare, providing strategic leadership and managing departmental staff.',
                'email' => 'education@shyogwe.org',
                'phone' => '+250786396515',
                'icon' => 'GraduationCap',
            ],
            [
                'name' => 'UWAMALIYA Clementine',
                'title' => 'Assistant in the office of Bishop, Public Relation and M&E',
                'department_type' => 'assistant',
                'description' => 'The Assistant to the Bishop provides administrative, organizational, and communication support, ensuring the smooth operation of the Bishop\'s office and effective coordination with parishes, institutions, and partners.',
                'email' => 'assistant@shyogwe.org',
                'phone' => '+250788503392',
                'icon' => 'Building',
            ],
            [
                'name' => 'NKUSI Alexandre',
                'title' => 'Chief Accountant',
                'department_type' => 'administrator',
                'description' => 'To oversee and manage all financial operations of the Diocese, ensure proper accounting systems are in place, safeguard assets, and provide accurate and timely financial reports that support decision-making and accountability.',
                'email' => 'administrator@shyogwe.org',
                'phone' => '+250788594976',
                'icon' => 'Building',
            ],
        ];

        foreach ($departments as $index => $department) {
            Team::create(array_merge($department, [
                'position' => 'Department Head',
                'bio' => $department['description'],
                'image' => $availableImages[($index % count($availableImages))] ?? '/placeholder.svg',
                'category' => 'department',
                'is_active' => true,
                'display_order' => $index + 10,
            ]));
        }
    }
}
