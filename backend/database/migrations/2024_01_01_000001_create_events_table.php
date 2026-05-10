<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sport_type', 100)->default('general');
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('banner')->nullable();
            $table->string('location');
            $table->string('city', 100);
            $table->string('province', 100);
            $table->date('registration_start');
            $table->date('registration_end');
            $table->date('event_start');
            $table->date('event_end');
            $table->enum('status', ['draft', 'registration_open', 'registration_closed', 'ongoing', 'finished'])->default('draft');
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        // Add FK from users to events after events table exists
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('event_id')->references('id')->on('events')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
        });
        Schema::dropIfExists('events');
    }
};
