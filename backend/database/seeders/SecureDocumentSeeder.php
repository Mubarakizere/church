<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SecureDocument;
use Illuminate\Support\Facades\Hash;

class SecureDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documents = [
            [
                'title' => 'Diocesan Synod Executive Council Minutes 2025',
                'description' => 'Official confidential minutes and resolutions of the Shyogwe Diocesan Synod Executive Committee session.',
                'category' => 'Synod & Councils',
                'file_path' => 'documents/synod_exec_minutes_2025.pdf',
                'original_filename' => 'synod_exec_minutes_2025.pdf',
                'file_type' => 'pdf',
                'file_size' => 2450000,
                'access_level' => 'role_based',
                'password' => null,
                'allowed_roles' => ['admin', 'editor'],
                'is_public' => true,
                'is_active' => true,
                'download_allowed' => false,
                'download_count' => 0,
                'view_count' => 42,
                'uploaded_by' => 1,
            ],
            [
                'title' => 'Diocesan Financial Audit Report FY 2024-2025',
                'description' => 'Independent statutory audit report and financial statements of EAR Shyogwe Diocese presented by chartered external auditors.',
                'category' => 'Financial Audits',
                'file_path' => 'documents/shyogwe_audit_report_fy25.pdf',
                'original_filename' => 'shyogwe_audit_report_fy25.pdf',
                'file_type' => 'pdf',
                'file_size' => 4890000,
                'access_level' => 'password',
                'password' => Hash::make('ShyogweAudit2025!'),
                'allowed_roles' => null,
                'is_public' => true,
                'is_active' => true,
                'download_allowed' => true,
                'download_count' => 23,
                'view_count' => 88,
                'uploaded_by' => 1,
            ],
            [
                'title' => 'Clergy Deployment & Pastoral Mandates Directory',
                'description' => 'Comprehensive directory of active clergy postings, parish assignments, and ecclesiastical licenses across all archdeaconries.',
                'category' => 'Clergy & Personnel',
                'file_path' => 'documents/clergy_deployment_confidential_2025.docx',
                'original_filename' => 'clergy_deployment_confidential_2025.docx',
                'file_type' => 'docx',
                'file_size' => 1350000,
                'access_level' => 'role_based',
                'password' => null,
                'allowed_roles' => ['admin'],
                'is_public' => false,
                'is_active' => true,
                'download_allowed' => false,
                'download_count' => 2,
                'view_count' => 15,
                'uploaded_by' => 1,
            ],
            [
                'title' => 'Diocesan Land Registry & Title Deeds Inventory',
                'description' => 'Official registry of ecclesiastical properties, titling records, and parish plot deeds verified by the diocesan legal office.',
                'category' => 'Legal & Assets',
                'file_path' => 'documents/diocesan_land_deeds_registry.xlsx',
                'original_filename' => 'diocesan_land_deeds_registry.xlsx',
                'file_type' => 'xlsx',
                'file_size' => 3200000,
                'access_level' => 'password',
                'password' => Hash::make('VaultTitleDeeds77!'),
                'allowed_roles' => null,
                'is_public' => true,
                'is_active' => true,
                'download_allowed' => false,
                'download_count' => 5,
                'view_count' => 31,
                'uploaded_by' => 1,
            ],
            [
                'title' => "Bishop's Private Pastoral Directives to Archdeacons",
                'description' => 'Episcopal directives on regional governance, parish oversight, and doctrinal standards issued by the Bishop.',
                'category' => 'Episcopal Decrees',
                'file_path' => 'documents/episcopal_directives_archdeacons.pdf',
                'original_filename' => 'episcopal_directives_archdeacons.pdf',
                'file_type' => 'pdf',
                'file_size' => 980000,
                'access_level' => 'role_based',
                'password' => null,
                'allowed_roles' => ['admin', 'editor'],
                'is_public' => false,
                'is_active' => true,
                'download_allowed' => false,
                'download_count' => 0,
                'view_count' => 19,
                'uploaded_by' => 1,
            ],
            [
                'title' => 'Healthcare Facilities Capital Budget & Grants 2025',
                'description' => 'Capital allocation budgets, donor grants breakdown, and medical equipment procurement schedules for Diocesan Health Centers.',
                'category' => 'Health Facilities',
                'file_path' => 'documents/health_facilities_grants_2025.pdf',
                'original_filename' => 'health_facilities_grants_2025.pdf',
                'file_type' => 'pdf',
                'file_size' => 3620000,
                'access_level' => 'password',
                'password' => Hash::make('HealthGrants2025!'),
                'allowed_roles' => null,
                'is_public' => true,
                'is_active' => true,
                'download_allowed' => true,
                'download_count' => 14,
                'view_count' => 54,
                'uploaded_by' => 1,
            ],
        ];

        foreach ($documents as $doc) {
            SecureDocument::updateOrCreate(
                ['title' => $doc['title']],
                $doc
            );
        }
    }
}
