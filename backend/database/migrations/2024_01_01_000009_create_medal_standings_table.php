<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medal_standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contingent_id')->constrained()->cascadeOnDelete();
            $table->integer('gold')->default(0);
            $table->integer('silver')->default(0);
            $table->integer('bronze')->default(0);
            $table->integer('total_medals')->storedAs('gold + silver + bronze');
            $table->integer('rank')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->unique(['event_id', 'contingent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medal_standings');
    }
};
