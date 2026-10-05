<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (!Schema::hasColumn('documents', 'category')) {
                $table->string('category')->nullable()->default('pastoral')->after('title');
            }
            if (!Schema::hasColumn('documents', 'description')) {
                $table->text('description')->nullable()->after('category');
            }
            if (!Schema::hasColumn('documents', 'file_size')) {
                $table->string('file_size')->nullable()->default('1.5 MB')->after('file');
            }
            if (!Schema::hasColumn('documents', 'download_count')) {
                $table->integer('download_count')->default(0)->after('file_size');
            }
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['category', 'description', 'file_size', 'download_count']);
        });
    }
};
