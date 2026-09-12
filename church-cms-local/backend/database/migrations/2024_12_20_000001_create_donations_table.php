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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('donation_type');
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'failed', 'cancelled'])->default('pending');
            $table->string('payment_method')->default('in_person');
            $table->string('transaction_id')->nullable();
            $table->string('currency', 3)->default('RWF');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['status', 'created_at']);
            $table->index('email');
            $table->index('donation_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
