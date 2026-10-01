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
        Schema::create('secure_documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            
            // File information
            $table->string('file_path'); // Storage path
            $table->string('original_filename');
            $table->string('file_type', 50); // pdf, docx, xlsx, etc.
            $table->unsignedBigInteger('file_size'); // in bytes
            
            // Access control
            $table->string('access_level', 50)->default('password'); // public, password, role_based
            $table->string('password')->nullable(); // Hashed password
            $table->text('allowed_roles')->nullable(); // JSON array or text
            
            // Visibility & Control
            $table->boolean('is_public')->default(false); // Show on public website
            $table->boolean('is_active')->default(true); // Active in admin dashboard
            $table->boolean('download_allowed')->default(true);
            
            // Tracking
            $table->unsignedBigInteger('download_count')->default(0);
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamp('last_downloaded_at')->nullable();
            
            // Metadata
            $table->unsignedBigInteger('uploaded_by')->nullable(); // User ID who uploaded
            $table->timestamps();
            
            // Indexes
            $table->index('category');
            $table->index('access_level');
            $table->index('is_public');
            $table->index('is_active');
        });
        
        // Download logs table for tracking
        if (!Schema::hasTable('secure_document_downloads')) {
            Schema::create('secure_document_downloads', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('secure_document_id');
                $table->unsignedBigInteger('user_id')->nullable(); // Null if anonymous
                $table->string('ip_address', 45);
                $table->string('user_agent', 500)->nullable();
                $table->boolean('access_granted')->default(true);
                $table->string('access_method', 50)->nullable(); // 'password', 'role', 'public'
                $table->timestamp('downloaded_at');
                
                $table->foreign('secure_document_id')
                      ->references('id')
                      ->on('secure_documents')
                      ->onDelete('cascade');
                      
                $table->index('secure_document_id');
                $table->index('user_id');
                $table->index('downloaded_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secure_document_downloads');
        Schema::dropIfExists('secure_documents');
    }
};
