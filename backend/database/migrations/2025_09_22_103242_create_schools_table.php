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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', [
                'ecd', // Early Childhood Development
                'primary', // Primary schools
                'secondary_basic', // Nine and twelve years basic education
                'secondary_boarding', // General education boarding
                'tss_boarding', // Technical Secondary School boarding
                'university' // University
            ]);
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('image')->nullable();
            $table->integer('founded_year')->nullable();
            $table->text('programs_offered')->nullable(); // JSON encoded programs
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
