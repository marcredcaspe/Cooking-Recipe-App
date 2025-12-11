<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\UserFavorite;
use App\Services\MealDBService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserContentController extends Controller
{
    /**
     * Display the user's dashboard with their favorites.
     */
    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('Dashboard', [
            'favorites' => UserFavorite::where('user_id', $user->id)
                ->with(['meal.ingredients', 'meal.steps'])
                ->latest()
                ->get(),
            'userMeals' => Meal::where('user_id', $user->id)
                ->where('source', 'USER')
                ->with(['ingredients', 'steps'])
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Store a new favorite recipe.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'meal_id' => ['required', 'string', 'exists:Meals,meal_id'],
        ]);

        $user = Auth::user();

        UserFavorite::firstOrCreate([
            'user_id' => $user->id,
            'meal_id' => $validated['meal_id'],
        ]);

        return redirect()->route('dashboard')->with('flash', [
            'message' => 'Recipe added to favorites!',
        ]);
    }

    /**
     * Remove a favorite recipe.
     */
    public function destroy(Request $request, string $mealId): RedirectResponse
    {
        $user = Auth::user();

        UserFavorite::where('user_id', $user->id)
            ->where('meal_id', $mealId)
            ->delete();

        return redirect()->route('dashboard')->with('flash', [
            'message' => 'Recipe removed from favorites.',
        ]);
    }

    /**
     * Fetch a random recipe from TheMealDB API.
     */
    public function randomRecipe(MealDBService $mealDBService): Response
    {
        $apiMeal = $mealDBService->fetchRandomMeal();

        if (!$apiMeal) {
            return redirect()->route('dashboard')->with('flash', [
                'error' => 'Failed to fetch random recipe. Please try again.',
            ]);
        }

        // Save the meal to database so it can be favorited
        $meal = $mealDBService->saveMealFromAPI($apiMeal);

        // Format for display
        $formattedMeal = $mealDBService->formatMealForDisplay($apiMeal);

        return Inertia::render('Dashboard', [
            'randomRecipe' => $formattedMeal,
            'favorites' => UserFavorite::where('user_id', Auth::id())
                ->with(['meal.ingredients', 'meal.steps'])
                ->latest()
                ->get(),
            'userMeals' => Meal::where('user_id', Auth::id())
                ->where('source', 'USER')
                ->with(['ingredients', 'steps'])
                ->latest()
                ->get(),
        ]);
    }
}

