<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Meal_Steps', function (Blueprint $table) {
            $table->id();
            $table->string('meal_id', 10);
            $table->unsignedInteger('step_number');
            $table->text('step_description');

            $table->foreign('meal_id')
                ->references('meal_id')
                ->on('Meals')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Meal_Steps');
    }
};

