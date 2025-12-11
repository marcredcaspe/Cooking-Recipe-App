<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Meal_Ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('meal_id', 10);
            $table->string('ingredient', 255);

            $table->foreign('meal_id')
                ->references('meal_id')
                ->on('Meals')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Meal_Ingredients');
    }
};

