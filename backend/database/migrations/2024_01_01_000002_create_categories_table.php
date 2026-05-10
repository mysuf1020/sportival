<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug', 100);
            $table->enum('gender', ['male', 'female', 'mixed'])->default('male');
            $table->integer('age_min')->nullable();
            $table->integer('age_max')->nullable();
            $table->decimal('weight_min', 5, 2)->nullable();
            $table->decimal('weight_max', 5, 2)->nullable();
            $table->enum('competition_type', ['single_elimination', 'double_elimination', 'round_robin'])->default('single_elimination');
            $table->string('sport_discipline', 100)->nullable();
            $table->integer('max_participants')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['event_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
