<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'users',
            'teams',
            'schools',
            'health_centers',
            'health_posts',
            'programs',
            'services',
            'partners',
            'news',
            'gallery',
            'contents',
            'jobs',
            'failed_jobs',
        ];

        foreach ($tables as $table) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'id')) {
                continue;
            }

            try {
                // First try adding AUTO_INCREMENT assuming PRIMARY KEY is already present
                DB::statement("ALTER TABLE `{$table}` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT");
            } catch (\Throwable $e1) {
                try {
                    // If no primary key exists, add AUTO_INCREMENT and PRIMARY KEY together
                    DB::statement("ALTER TABLE `{$table}` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (`id`)");
                } catch (\Throwable $e2) {
                    // Table might already be properly configured or has another primary key configuration
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal needed
    }
};
