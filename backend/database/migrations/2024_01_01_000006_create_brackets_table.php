<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brackets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->enum('format', ['single_elimination', 'double_elimination', 'round_robin'])->default('single_elimination');
            $table->enum('status', ['pending', 'ongoing', 'finished'])->default('pending');
            $table->json('bracket_data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brackets');
    }
};
