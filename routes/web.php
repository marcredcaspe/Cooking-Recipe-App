<?php

use App\Http\Controllers\MealController;
use App\Http\Controllers\UserContentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [MealController::class, 'index'])->name('welcome');

// Include authentication routes
require __DIR__.'/auth.php';

// Protected routes (require authentication)
Route::middleware(['auth'])->group(function () {
    // Dashboard/Favorites Page (Read/View)
    Route::get('/dashboard', [UserContentController::class, 'index'])->name('dashboard');

    // Random recipe
    Route::get('/dashboard/random-recipe', [UserContentController::class, 'randomRecipe'])->name('dashboard.random');

    // CRUD Endpoints (Create, Update, Delete)
    Route::post('/favorites', [UserContentController::class, 'store'])->name('favorites.store');
    Route::delete('/favorites/{mealId}', [UserContentController::class, 'destroy'])->name('favorites.destroy');

    // Meal details page
    Route::get('/meal/{mealId}', [MealController::class, 'show'])->name('meal.details');
});

// Legacy/test routes - PROTECTED (require authentication)
Route::middleware(['auth'])->group(function () {
    Route::post('/users', [MealController::class, 'storeUser'])->name('users.store');
    Route::post('/meals', [MealController::class, 'storeMeal'])->name('meals.store');
    Route::get('/meal/test', [MealController::class, 'testForm'])->name('meal.test');
    Route::post('/meal/test-submit', [MealController::class, 'testSubmit'])->name('meal.testSubmit');
});
