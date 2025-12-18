<?php

namespace App\Services;

use App\Models\Meal;
use App\Models\MealIngredient;
use App\Models\MealStep;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MealDBService
{
    /**
     * Cache duration in minutes for API responses.
     */
    private const CACHE_DURATION = 60; // 1 hour

    /**
     * Create an HTTP client with SSL verification disabled for development.
     * Note: This should only be used in development. For production, configure proper SSL certificates.
     */
    private function httpClient()
    {
        return Http::withoutVerifying();
    }

    /**
     * Fetch a meal from TheMealDB API by ID with caching.
     */
    public function fetchMealById(string $mealId): ?array
    {
        $cacheKey = "meal_api_id_{$mealId}";

        return Cache::remember($cacheKey, now()->addMinutes(self::CACHE_DURATION), function () use ($mealId) {
            $response = $this->httpClient()->get("https://www.themealdb.com/api/json/v1/1/lookup.php?i={$mealId}");

            if (!$response->successful() || empty($response->json()['meals'])) {
                return null;
            }

            return $response->json()['meals'][0];
        });
    }

    /**
     * Search meals by name with caching.
     */
    public function searchMeals(string $query): array
    {
        $cacheKey = 'meal_api_search_' . md5(strtolower(trim($query)));

        return Cache::remember($cacheKey, now()->addMinutes(self::CACHE_DURATION), function () use ($query) {
            $response = $this->httpClient()->get("https://www.themealdb.com/api/json/v1/1/search.php?s={$query}");

            if (!$response->successful()) {
                return [];
            }

            return $response->json()['meals'] ?? [];
        });
    }

    /**
     * Fetch a random meal from TheMealDB API.
     * Note: Random meals are not cached since they should be different each time.
     * However, we cache the response for a short time to handle rapid requests.
     */
    public function fetchRandomMeal(): ?array
    {
        // Use a short cache (5 minutes) to prevent API abuse on rapid clicks
        // but still allow getting different random meals
        $cacheKey = 'meal_api_random_' . now()->format('Y-m-d-H-i'); // Changes every minute

        return Cache::remember($cacheKey, now()->addMinutes(5), function () {
            $response = $this->httpClient()->get("https://www.themealdb.com/api/json/v1/1/random.php");

            if (!$response->successful() || empty($response->json()['meals'])) {
                return null;
            }

            return $response->json()['meals'][0];
        });
    }

    /**
     * Format API meal data for display (extract ingredients and steps).
     */
    public function formatMealForDisplay(array $apiMeal): array
    {
        // Extract ingredients
        $ingredients = [];
        for ($i = 1; $i <= 20; $i++) {
            $ingredient = $apiMeal["strIngredient{$i}"] ?? null;
            $measure = $apiMeal["strMeasure{$i}"] ?? null;

            if (!empty($ingredient)) {
                $ingredients[] = [
                    'ingredient' => trim("{$measure} {$ingredient}"),
                ];
            }
        }

        // Extract instructions as steps
        $steps = [];
        if (!empty($apiMeal['strInstructions'])) {
            $instructionLines = preg_split('/\r\n|\r|\n/', $apiMeal['strInstructions']);
            $instructionLines = collect($instructionLines)
                ->map(fn ($step) => trim($step))
                ->filter()
                // Filter out step labels like "step 1", "step 2", "**step 1**", "1.", "2.", etc.
                ->filter(function ($line) {
                    $lineLower = strtolower($line);
                    // Remove markdown bold markers for checking
                    $lineClean = preg_replace('/\*\*/', '', $lineLower);
                    $lineClean = trim($lineClean);
                    
                    // Skip if line is just a step label
                    if (preg_match('/^step\s+\d+$/i', $lineClean)) {
                        return false;
                    }
                    // Skip if line is just a number with period (like "1.", "2.")
                    if (preg_match('/^\d+\.\s*$/', $lineClean)) {
                        return false;
                    }
                    // Skip if line is just "step 1", "step 2" etc. (case insensitive)
                    if (preg_match('/^step\s+\d+\.?\s*$/i', $lineClean)) {
                        return false;
                    }
                    
                    return true;
                })
                ->values()
                ->all();

            $steps = collect($instructionLines)->map(function ($step, $index) {
                // Remove any leading numbers and periods (like "1. ", "2. ")
                $step = preg_replace('/^\d+\.\s*/', '', $step);
                // Remove markdown bold markers
                $step = preg_replace('/\*\*/', '', $step);
                // Remove "step X" patterns from the beginning
                $step = preg_replace('/^step\s+\d+\.?\s*/i', '', $step);
                $step = trim($step);
                
                return [
                    'step_number' => $index + 1,
                    'step_description' => $step,
                ];
            })->filter(fn ($step) => !empty($step['step_description']))->values()->all();
        }

        return [
            'meal_id' => $apiMeal['idMeal'],
            'title' => $apiMeal['strMeal'],
            'thumbnail' => $apiMeal['strMealThumb'],
            'category' => $apiMeal['strCategory'] ?? null,
            'area' => $apiMeal['strArea'] ?? null,
            'instructions' => $apiMeal['strInstructions'] ?? null,
            'youtube' => $apiMeal['strYoutube'] ?? null,
            'source' => $apiMeal['strSource'] ?? null,
            'ingredients' => $ingredients,
            'steps' => $steps,
        ];
    }

    /**
     * Save a meal from TheMealDB API to the database.
     */
    public function saveMealFromAPI(array $apiMeal): Meal
    {
        $meal = Meal::updateOrCreate(
            ['meal_id' => $apiMeal['idMeal']],
            [
                'title' => $apiMeal['strMeal'],
                'thumbnail' => $apiMeal['strMealThumb'],
                'source' => 'API',
                'user_id' => null,
            ]
        );

        // Save ingredients
        $ingredients = [];
        for ($i = 1; $i <= 20; $i++) {
            $ingredient = $apiMeal["strIngredient{$i}"] ?? null;
            $measure = $apiMeal["strMeasure{$i}"] ?? null;

            if (!empty($ingredient)) {
                $ingredients[] = trim("{$measure} {$ingredient}");
            }
        }

        if (!empty($ingredients)) {
            $meal->ingredients()->delete();
            MealIngredient::insert(
                collect($ingredients)->map(fn ($ingredient) => [
                    'meal_id' => $meal->meal_id,
                    'ingredient' => $ingredient,
                ])->all()
            );
        }

        // Save instructions as steps
        if (!empty($apiMeal['strInstructions'])) {
            $steps = preg_split('/\r\n|\r|\n/', $apiMeal['strInstructions']);
            $steps = collect($steps)
                ->map(fn ($step) => trim($step))
                ->filter()
                // Filter out step labels like "step 1", "step 2", "**step 1**", "1.", "2.", etc.
                ->filter(function ($line) {
                    $lineLower = strtolower($line);
                    // Remove markdown bold markers for checking
                    $lineClean = preg_replace('/\*\*/', '', $lineLower);
                    $lineClean = trim($lineClean);
                    
                    // Skip if line is just a step label
                    if (preg_match('/^step\s+\d+$/i', $lineClean)) {
                        return false;
                    }
                    // Skip if line is just a number with period (like "1.", "2.")
                    if (preg_match('/^\d+\.\s*$/', $lineClean)) {
                        return false;
                    }
                    // Skip if line is just "step 1", "step 2" etc. (case insensitive)
                    if (preg_match('/^step\s+\d+\.?\s*$/i', $lineClean)) {
                        return false;
                    }
                    
                    return true;
                })
                ->map(function ($step) {
                    // Remove any leading numbers and periods (like "1. ", "2. ")
                    $step = preg_replace('/^\d+\.\s*/', '', $step);
                    // Remove markdown bold markers
                    $step = preg_replace('/\*\*/', '', $step);
                    // Remove "step X" patterns from the beginning
                    $step = preg_replace('/^step\s+\d+\.?\s*/i', '', $step);
                    return trim($step);
                })
                ->filter(fn ($step) => !empty($step))
                ->values()
                ->all();

            if (!empty($steps)) {
                $meal->steps()->delete();
                MealStep::insert(
                    collect($steps)->map(fn ($step, $index) => [
                        'meal_id' => $meal->meal_id,
                        'step_number' => $index + 1,
                        'step_description' => $step,
                    ])->all()
                );
            }
        }

        return $meal->fresh(['ingredients', 'steps']);
    }

    /**
     * Clear cache for a specific meal by ID.
     */
    public function clearMealCache(string $mealId): void
    {
        Cache::forget("meal_api_id_{$mealId}");
    }

    /**
     * Clear all meal API caches.
     * Useful for maintenance or when API data structure changes.
     */
    public function clearAllMealCaches(): void
    {
        // Note: This is a simple implementation. For production with many cache keys,
        // you might want to use cache tags or a more sophisticated approach.
        Cache::flush();
    }
}

