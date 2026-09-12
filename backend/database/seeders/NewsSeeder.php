<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\News;
use Carbon\Carbon;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $news = [
            [
                'title' => 'New Church Building Dedication Ceremony',
                'summary' => 'Join us for the dedication of our new church building in Muhanga District.',
                'content' => 'We are excited to announce the dedication ceremony for our new church building located in Muhanga District. This modern facility will serve as a spiritual home for our growing congregation and will feature state-of-the-art amenities for worship, fellowship, and community service. The ceremony will take place on December 15th, 2024, and all members are invited to participate in this historic occasion. The building includes a main sanctuary capable of seating 500 worshippers, Sunday school classrooms, a multipurpose hall, and administrative offices.',
                'author' => 'Rev. Dr. John Mwangi',
                'status' => 'published',
                'featured' => true,
                'published_at' => Carbon::now()->subDays(2),
            ],
            [
                'title' => 'Annual Youth Conference 2024',
                'summary' => 'Preparations are underway for the annual youth conference focusing on spiritual growth and leadership.',
                'content' => 'The Anglican Church of Rwanda, Shyogwe Diocese, is preparing for its annual youth conference scheduled for January 2025. This year\'s theme is "Walking in Faith, Leading with Purpose." The conference will bring together over 300 young people from across the diocese for three days of worship, learning, and fellowship. Topics will include biblical leadership principles, personal spiritual development, and community service initiatives. Registration is now open and early bird discounts are available.',
                'author' => 'Youth Ministry Team',
                'status' => 'published',
                'featured' => false,
                'published_at' => Carbon::now()->subDays(5),
            ],
            [
                'title' => 'Community Health Program Launch',
                'summary' => 'New health program launched to serve remote communities in the diocese.',
                'content' => 'A comprehensive community health program has been launched to provide essential healthcare services to remote communities within our diocese. The program will operate mobile clinics and establish health posts in underserved areas. Services include primary healthcare, maternal health support, immunization programs, and health education. Our trained medical volunteers will work alongside local health centers to ensure quality care reaches every corner of our diocese.',
                'author' => 'Health Ministry Committee',
                'status' => 'published',
                'featured' => true,
                'published_at' => Carbon::now()->subDays(7),
            ],
            [
                'title' => 'Bishop\'s Christmas Message 2024',
                'summary' => 'Read the Bishop\'s special Christmas message to the diocese.',
                'content' => 'Dear beloved members of the Anglican Church of Rwanda, Shyogwe Diocese, As we approach this holy season of Christmas, I am filled with gratitude for the love and dedication shown by our church community throughout this year. The birth of our Savior Jesus Christ reminds us of God\'s infinite love and the hope He brings to our world. Let us share this message of hope and love with our neighbors, especially those who are less fortunate. I pray that this Christmas season brings peace, joy, and renewed faith to all our families and communities.',
                'author' => 'Rt. Rev. Louis Pasteur KABAYIZA',
                'status' => 'published',
                'featured' => true,
                'published_at' => Carbon::now()->subDays(10),
            ],
            [
                'title' => 'Educational Scholarship Program Update',
                'summary' => 'Our scholarship program has supported 150 students this academic year.',
                'content' => 'We are pleased to report that our educational scholarship program has successfully supported 150 deserving students across various educational levels this academic year. The program, funded through generous donations from church members and partners, covers tuition fees, textbooks, and essential school supplies for students from economically disadvantaged families. Applications for the next academic year will open in March 2025. We encourage all eligible students to apply and continue pursuing their educational goals.',
                'author' => 'Education Ministry',
                'status' => 'published',
                'featured' => false,
                'published_at' => Carbon::now()->subDays(12),
            ],
            [
                'title' => 'New Sunday School Curriculum',
                'summary' => 'Introducing our new interactive Sunday school curriculum for children and youth.',
                'content' => 'We are excited to introduce our new interactive Sunday school curriculum designed specifically for our children and youth ministries. The curriculum emphasizes hands-on learning, biblical storytelling, and practical application of Christian principles in daily life. It includes age-appropriate activities for different age groups, from toddlers to teenagers. All Sunday school teachers will receive comprehensive training on the new curriculum and teaching methods in the coming weeks.',
                'author' => 'Children\'s Ministry Team',
                'status' => 'published',
                'featured' => false,
                'published_at' => Carbon::now()->subDays(15),
            ]
        ];

        foreach ($news as $newsItem) {
            News::create($newsItem);
        }
    }
}












