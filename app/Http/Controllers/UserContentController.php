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
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $favoritesQuery = UserFavorite::where('user_id', $user->id)
            ->with(['meal.ingredients', 'meal.steps']);

        // Filter by date if provided
        if ($request->has('date_filter')) {
            $dateFilter = $request->input('date_filter');
            if ($dateFilter === 'today') {
                $favoritesQuery->whereDate('created_at', today());
            } elseif ($dateFilter === 'week') {
                $favoritesQuery->where('created_at', '>=', now()->subWeek());
            } elseif ($dateFilter === 'month') {
                $favoritesQuery->where('created_at', '>=', now()->subMonth());
            } elseif ($dateFilter === 'year') {
                $favoritesQuery->where('created_at', '>=', now()->subYear());
            }
        }

        return Inertia::render('Dashboard', [
            'favorites' => $favoritesQuery->latest()->get(),
            'userMeals' => Meal::where('user_id', $user->id)
                ->where('source', 'USER')
                ->with(['ingredients', 'steps'])
                ->latest()
                ->get(),
            'dateFilter' => $request->input('date_filter', ''),
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
    public function randomRecipe(Request $request, MealDBService $mealDBService): Response
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

        $user = Auth::user();
        $favoritesQuery = UserFavorite::where('user_id', $user->id)
            ->with(['meal.ingredients', 'meal.steps']);

        // Filter by date if provided
        if ($request->has('date_filter')) {
            $dateFilter = $request->input('date_filter');
            if ($dateFilter === 'today') {
                $favoritesQuery->whereDate('created_at', today());
            } elseif ($dateFilter === 'week') {
                $favoritesQuery->where('created_at', '>=', now()->subWeek());
            } elseif ($dateFilter === 'month') {
                $favoritesQuery->where('created_at', '>=', now()->subMonth());
            } elseif ($dateFilter === 'year') {
                $favoritesQuery->where('created_at', '>=', now()->subYear());
            }
        }

        return Inertia::render('Dashboard', [
            'randomRecipe' => $formattedMeal,
            'favorites' => $favoritesQuery->latest()->get(),
            'userMeals' => Meal::where('user_id', $user->id)
                ->where('source', 'USER')
                ->with(['ingredients', 'steps'])
                ->latest()
                ->get(),
            'dateFilter' => $request->input('date_filter', ''),
        ]);
    }
}

