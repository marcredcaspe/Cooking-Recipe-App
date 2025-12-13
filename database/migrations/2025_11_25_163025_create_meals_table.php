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
        Schema::create('Meals', function (Blueprint $table) {
            $table->string('meal_id', 10)->primary();
            $table->string('title', 100);
            $table->string('thumbnail', 255)->nullable();
            $table->enum('source', ['API', 'USER']);
            $table->string('user_id', 10)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('user_id')
                ->references('id')
                ->on('Users')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Meals');
    }
};
