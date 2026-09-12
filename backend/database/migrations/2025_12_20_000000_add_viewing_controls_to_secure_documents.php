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
            $table->boolean('download_allowed')->default(true)->after('is_active');
            $table->unsignedInteger('view_count')->default(0)->after('download_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('secure_documents', function (Blueprint $table) {
            $table->dropColumn(['download_allowed', 'view_count']);
        });
    }
};
