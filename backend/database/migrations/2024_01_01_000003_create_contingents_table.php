<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contingents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('region', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('contact_person');
            $table->string('phone', 20);
            $table->string('email')->nullable();
            $table->string('logo')->nullable();
            $table->enum('status', ['active', 'disqualified'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contingents');
    }
};
