<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Document;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        try {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE documents MODIFY id bigint(20) unsigned NOT NULL AUTO_INCREMENT;');
        } catch (\Exception $e) {
            // Already auto-increment or not supported
        }

        $docs = [
            [
                'title' => 'Diocesan Strategic Plan (2024–2029)',
                'category' => 'pastoral',
                'description' => 'Five-year comprehensive development framework outlining diocesan priorities in evangelism, education across 38 schools, community health, and economic resilience.',
                'file' => '/storage/documents/diocesan-strategic-plan-2024-2029.pdf',
                'file_size' => '3.4 MB',
                'download_count' => 384,
                'is_active' => true,
            ],
            [
                'title' => 'Resolutions of the 14th Diocesan Synod',
                'category' => 'pastoral',
                'description' => 'Official canonical resolutions, pastoral guidance, archdeaconry territorial reviews, and resolutions enacted during the 14th Synod of Shyogwe Diocese.',
                'file' => '/storage/documents/resolutions-14th-synod.pdf',
                'file_size' => '1.8 MB',
                'download_count' => 512,
                'is_active' => true,
            ],
            [
                'title' => 'Pastoral Letter on Christian Stewardship & Family Renewal',
                'category' => 'pastoral',
                'description' => 'Episcopal pastoral letter from the Diocesan Bishop addressing parish stewardship, Christian marriage, family prayer, and youth discipleship.',
                'file' => '/storage/documents/pastoral-letter-stewardship.pdf',
                'file_size' => '920 KB',
                'download_count' => 245,
                'is_active' => true,
            ],
            [
                'title' => 'Diocesan Constitution & Canonical Regulations',
                'category' => 'governance',
                'description' => 'Governing canons, diocesan council charter, parish vestry constitutions, and ministerial regulations of the Anglican Church of Rwanda, Shyogwe Diocese.',
                'file' => '/storage/documents/diocesan-constitution-canons.pdf',
                'file_size' => '4.2 MB',
                'download_count' => 620,
                'is_active' => true,
            ],
            [
                'title' => 'Clergy & Lay Ministers Service Directory (2025/2026)',
                'category' => 'governance',
                'description' => 'Official directory of licensed clergy, parish rectors, curates, archdeacons, and accredited lay ministers with jurisdiction assignments.',
                'file' => '/storage/documents/clergy-directory-2025-2026.pdf',
                'file_size' => '2.1 MB',
                'download_count' => 178,
                'is_active' => true,
            ],
            [
                'title' => 'Anglican Liturgical Calendar & Lectionary Guide 2025',
                'category' => 'liturgical',
                'description' => 'Annual liturgical lectionary containing Sunday scripture readings, Holy Communion orders, saint commemorations, and liturgical colors.',
                'file' => '/storage/documents/liturgical-calendar-2025.pdf',
                'file_size' => '1.5 MB',
                'download_count' => 890,
                'is_active' => true,
            ],
            [
                'title' => 'Annual Diocesan Development & Education Report',
                'category' => 'reports',
                'description' => 'Annual progress report detailing infrastructure development, academic performance across 38 diocesan schools, and technical colleges.',
                'file' => '/storage/documents/annual-education-report.pdf',
                'file_size' => '5.6 MB',
                'download_count' => 310,
                'is_active' => true,
            ],
            [
                'title' => 'Diocesan Health Facilities Operational Guidelines',
                'category' => 'health',
                'description' => 'Clinical protocols, hygiene governance, and community health post operating procedures for Hanika and Gitarama health networks.',
                'file' => '/storage/documents/health-facilities-guidelines.pdf',
                'file_size' => '2.8 MB',
                'download_count' => 195,
                'is_active' => true,
            ],
        ];

        foreach ($docs as $doc) {
            Document::updateOrCreate(
                ['title' => $doc['title']],
                $doc
            );
        }
    }
}
