<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('judge_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('registration_id')->constrained('registrations')->cascadeOnDelete();
            $table->integer('round_number')->default(1);
            $table->decimal('score', 7, 2)->default(0);
            $table->integer('penalties')->default(0);
            $table->json('score_data')->nullable();
            $table->timestamps();

            $table->unique(['match_id', 'judge_id', 'registration_id', 'round_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_scores');
    }
};
