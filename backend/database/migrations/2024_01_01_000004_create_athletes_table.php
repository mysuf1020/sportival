<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('athletes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contingent_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('gender', ['male', 'female']);
            $table->date('birth_date')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->string('photo')->nullable();
            $table->string('id_number', 50)->nullable();
            $table->enum('status', ['active', 'disqualified'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('athletes');
    }
};
