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
    public function index(Request $request, MealDBService $mealDBService): Response
    {
        $user = Auth::user();

        $favoritesQuery = UserFavorite::where('user_id', $user->id)
            ->with(['meal.ingredients', 'meal.steps']);

        // Search by meal title if provided (for favorites)
        $favoriteSearch = $request->input('favorite_search', '');
        if (!empty($favoriteSearch)) {
            $favoritesQuery->whereHas('meal', function ($query) use ($favoriteSearch) {
                $query->where('title', 'like', '%' . $favoriteSearch . '%');
            });
        }

        // Filter by meal's date uploaded (created_at) if provided
        if ($request->has('date_filter') && !empty($request->input('date_filter'))) {
            $dateFilter = $request->input('date_filter');
            $favoritesQuery->whereHas('meal', function ($query) use ($dateFilter) {
                if ($dateFilter === 'today') {
                    $query->whereDate('created_at', today());
                } elseif ($dateFilter === 'week') {
                    $query->where('created_at', '>=', now()->subWeek());
                } elseif ($dateFilter === 'month') {
                    $query->where('created_at', '>=', now()->subMonth());
                } elseif ($dateFilter === 'year') {
                    $query->where('created_at', '>=', now()->subYear());
                }
            });
        }

        // Search recipes from both API and database
        $recipeSearch = $request->input('recipe_search', '');
        $searchResults = collect();
        
        if (!empty($recipeSearch)) {
            // Search database meals
            $dbMeals = Meal::where('title', 'like', '%' . $recipeSearch . '%')
                ->with(['creator', 'ingredients', 'steps'])
                ->get();

            // Search API meals
            $apiMeals = $mealDBService->searchMeals($recipeSearch);
            $formattedApiMeals = collect($apiMeals)->map(function ($apiMeal) use ($mealDBService) {
                // Save API meal to database if not already saved
                $meal = $mealDBService->saveMealFromAPI($apiMeal);
                
                // Load the saved meal with relationships to match database format exactly
                return Meal::with(['creator', 'ingredients', 'steps'])
                    ->where('meal_id', $meal->meal_id)
                    ->first();
            })->filter(); // Remove any null values

            // Combine and deduplicate by meal_id
            $searchResults = $dbMeals->concat($formattedApiMeals)
                ->unique('meal_id')
                ->values();
        }

        return Inertia::render('Dashboard', [
            'favorites' => $favoritesQuery->latest()->get(),
            'userMeals' => Meal::where('user_id', $user->id)
                ->where('source', 'USER')
                ->with(['ingredients', 'steps'])
                ->latest()
                ->get(),
            'dateFilter' => $request->input('date_filter', ''),
            'favoriteSearch' => $favoriteSearch,
            'recipeSearch' => $recipeSearch,
            'searchResults' => $searchResults,
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

        // Search by meal title if provided (for favorites)
        $favoriteSearch = $request->input('favorite_search', '');
        if (!empty($favoriteSearch)) {
            $favoritesQuery->whereHas('meal', function ($query) use ($favoriteSearch) {
                $query->where('title', 'like', '%' . $favoriteSearch . '%');
            });
        }

        // Filter by meal's date uploaded (created_at) if provided
        if ($request->has('date_filter') && !empty($request->input('date_filter'))) {
            $dateFilter = $request->input('date_filter');
            $favoritesQuery->whereHas('meal', function ($query) use ($dateFilter) {
                if ($dateFilter === 'today') {
                    $query->whereDate('created_at', today());
                } elseif ($dateFilter === 'week') {
                    $query->where('created_at', '>=', now()->subWeek());
                } elseif ($dateFilter === 'month') {
                    $query->where('created_at', '>=', now()->subMonth());
                } elseif ($dateFilter === 'year') {
                    $query->where('created_at', '>=', now()->subYear());
                }
            });
        }

        // Search recipes from both API and database
        $recipeSearch = $request->input('recipe_search', '');
        $searchResults = collect();
        
        if (!empty($recipeSearch)) {
            // Search database meals
            $dbMeals = Meal::where('title', 'like', '%' . $recipeSearch . '%')
                ->with(['creator', 'ingredients', 'steps'])
                ->get();

            // Search API meals
            $apiMeals = $mealDBService->searchMeals($recipeSearch);
            $formattedApiMeals = collect($apiMeals)->map(function ($apiMeal) use ($mealDBService) {
                // Save API meal to database if not already saved
                $meal = $mealDBService->saveMealFromAPI($apiMeal);
                
                // Load the saved meal with relationships to match database format exactly
                return Meal::with(['creator', 'ingredients', 'steps'])
                    ->where('meal_id', $meal->meal_id)
                    ->first();
            })->filter(); // Remove any null values

            // Combine and deduplicate by meal_id
            $searchResults = $dbMeals->concat($formattedApiMeals)
                ->unique('meal_id')
                ->values();
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
            'favoriteSearch' => $favoriteSearch,
            'recipeSearch' => $recipeSearch,
            'searchResults' => $searchResults,
        ]);
    }
}

