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
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position')->nullable();
            $table->string('title')->nullable();
            $table->text('bio')->nullable();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->json('social_media')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->string('category')->default('department'); // bishop, archdeacon, department
            $table->string('department_type')->nullable(); // for departments: daf, finance, hr, etc.
            $table->string('region')->nullable(); // for archdeacons: muhanga, kamonyi, etc.
            $table->string('icon')->nullable(); // for departments
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
