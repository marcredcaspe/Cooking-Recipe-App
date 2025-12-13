<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('User_Favorites', function (Blueprint $table) {
            $table->id();
            $table->string('user_id', 10);
            $table->string('meal_id', 10);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')
                ->references('id')
                ->on('Users')
                ->cascadeOnDelete();

            $table->foreign('meal_id')
                ->references('meal_id')
                ->on('Meals')
                ->cascadeOnDelete();

            $table->unique(['user_id', 'meal_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('User_Favorites');
    }
};
