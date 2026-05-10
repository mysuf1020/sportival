<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('athlete_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('registration_number', 20)->unique()->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected', 'disqualified'])->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->integer('seeding')->nullable();
            $table->timestamps();

            $table->unique(['athlete_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
