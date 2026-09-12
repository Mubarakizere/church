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
        Schema::table('events', function (Blueprint $table) {
            $table->string('attendees')->nullable()->after('location');
            $table->boolean('featured')->default(false)->after('attendees');
            $table->boolean('is_recurring')->default(false)->after('featured');
            $table->string('recurrence_pattern')->nullable()->after('is_recurring');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['attendees', 'featured', 'is_recurring', 'recurrence_pattern']);
        });
    }
};
