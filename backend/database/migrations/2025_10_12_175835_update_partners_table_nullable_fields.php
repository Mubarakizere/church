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
        Schema::table('partners', function (Blueprint $table) {
            // Make these fields nullable
            $table->string('country')->nullable()->change();
            $table->string('type')->nullable()->change();
            $table->text('description')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            // Revert back to not nullable (but this might fail if there are null values)
            $table->string('country')->nullable(false)->change();
            $table->string('type')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
        });
    }
};
