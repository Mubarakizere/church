<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('secure_documents', function (Blueprint $table) {
            if (!Schema::hasColumn('secure_documents', 'download_allowed')) {
                $table->boolean('download_allowed')->default(true)->after('is_active');
            }
            if (!Schema::hasColumn('secure_documents', 'view_count')) {
                $table->unsignedInteger('view_count')->default(0)->after('download_count');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('secure_documents', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('secure_documents', 'download_allowed')) {
                $columnsToDrop[] = 'download_allowed';
            }
            if (Schema::hasColumn('secure_documents', 'view_count')) {
                $columnsToDrop[] = 'view_count';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
