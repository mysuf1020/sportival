<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bracket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->integer('round');
            $table->integer('match_number');
            $table->foreignId('registration1_id')->nullable()->constrained('registrations')->nullOnDelete();
            $table->foreignId('registration2_id')->nullable()->constrained('registrations')->nullOnDelete();
            $table->foreignId('winner_registration_id')->nullable()->constrained('registrations')->nullOnDelete();
            $table->string('court', 50)->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->enum('status', ['pending', 'ongoing', 'finished', 'walkover', 'bye'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
