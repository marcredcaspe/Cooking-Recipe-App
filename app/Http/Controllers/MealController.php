<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\MealIngredient;
use App\Models\MealStep;
use App\Models\User;
use App\Models\UserFavorite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MealController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Welcome', [
            'meals' => Meal::with(['creator', 'ingredients', 'steps'])->latest()->take(12)->get(),
        ]);
    }

    public function show(string $mealId): Response
    {
        $meal = Meal::with(['creator', 'ingredients', 'steps'])
            ->where('meal_id', $mealId)
            ->firstOrFail();

        $canEdit = Auth::check() && ($meal->user_id === Auth::id() || $meal->source === 'USER');

        return Inertia::render('MealDetails', [
            'meal' => $meal,
            'canEdit' => $canEdit,
        ]);
    }

    /**
     * Store a new recipe created by the user.
     */
    public function storeRecipe(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'thumbnail_url' => ['nullable', 'string', 'max:255'],
            'ingredients' => ['required', 'string'],
            'steps' => ['required', 'string'],
        ]);

        $user = Auth::user();

        // Handle image upload
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $storedPath = $request->file('thumbnail')->store('recipes', 'public');
            $thumbnailPath = asset('storage/' . $storedPath);
        } elseif (!empty($data['thumbnail_url'])) {
            $thumbnailPath = $data['thumbnail_url'];
        }

        $ingredients = $this->parseLines($data['ingredients']);
        $steps = $this->parseLines($data['steps']);

        $this->ensureList($ingredients, 'ingredients');
        $this->ensureList($steps, 'steps');

        $meal = DB::transaction(function () use ($data, $ingredients, $steps, $thumbnailPath, $user) {
            $meal = $this->persistMeal([
                'meal_id' => Str::upper(Str::random(10)),
                'title' => $data['title'],
                'thumbnail' => $thumbnailPath,
                'source' => 'USER',
                'user_id' => $user->id,
            ]);
            $this->syncIngredients($meal, $ingredients);
            $this->syncSteps($meal, $steps);

            return $meal;
        });

        return redirect()->route('meal.details', $meal->meal_id)->with('flash', [
            'message' => "Recipe '{$meal->title}' created successfully!",
        ]);
    }

    /**
     * Update an existing recipe.
     */
    public function updateRecipe(Request $request, string $mealId): RedirectResponse
    {
        $meal = Meal::where('meal_id', $mealId)->firstOrFail();
        $user = Auth::user();

        // Check if user can edit this recipe
        if ($meal->user_id !== $user->id || $meal->source !== 'USER') {
            abort(403, 'You do not have permission to edit this recipe.');
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'thumbnail_url' => ['nullable', 'string', 'max:255'],
            'ingredients' => ['required', 'string'],
            'steps' => ['required', 'string'],
        ]);

        // Handle image upload
        $thumbnailPath = $meal->thumbnail; // Keep existing thumbnail by default
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if it exists and is stored locally
            if ($meal->thumbnail && (strpos($meal->thumbnail, '/storage/') !== false || strpos($meal->thumbnail, 'storage/') !== false)) {
                $oldPath = str_replace([asset('storage/'), '/storage/', 'storage/'], '', $meal->thumbnail);
                Storage::disk('public')->delete($oldPath);
            }
            $storedPath = $request->file('thumbnail')->store('recipes', 'public');
            $thumbnailPath = asset('storage/' . $storedPath);
        } elseif (!empty($data['thumbnail_url'])) {
            $thumbnailPath = $data['thumbnail_url'];
        }

        $ingredients = $this->parseLines($data['ingredients']);
        $steps = $this->parseLines($data['steps']);

        $this->ensureList($ingredients, 'ingredients');
        $this->ensureList($steps, 'steps');

        DB::transaction(function () use ($meal, $data, $ingredients, $steps, $thumbnailPath) {
            $meal->update([
                'title' => $data['title'],
                'thumbnail' => $thumbnailPath,
            ]);
            $this->syncIngredients($meal, $ingredients);
            $this->syncSteps($meal, $steps);
        });

        return redirect()->route('meal.details', $meal->meal_id)->with('flash', [
            'message' => "Recipe '{$meal->title}' updated successfully!",
        ]);
    }

    /**
     * Delete a recipe.
     */
    public function deleteRecipe(Request $request, string $mealId): RedirectResponse
    {
        $meal = Meal::where('meal_id', $mealId)->firstOrFail();
        $user = Auth::user();

        // Check if user can delete this recipe
        if ($meal->user_id !== $user->id || $meal->source !== 'USER') {
            abort(403, 'You do not have permission to delete this recipe.');
        }

        DB::transaction(function () use ($meal) {
            // Delete thumbnail if it exists and is stored locally
            if ($meal->thumbnail && strpos($meal->thumbnail, '/storage/') !== false) {
                $oldPath = str_replace('/storage/', '', $meal->thumbnail);
                Storage::disk('public')->delete($oldPath);
            }

            // Delete related ingredients and steps (cascade should handle this, but being explicit)
            $meal->ingredients()->delete();
            $meal->steps()->delete();

            // Delete the meal
            $meal->delete();
        });

        return redirect()->route('dashboard')->with('flash', [
            'message' => 'Recipe deleted successfully.',
        ]);
    }

    public function storeUser(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id' => ['nullable', 'string', 'max:10', 'unique:Users,id'],
            'name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:50', 'unique:Users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = $this->persistUser($data);

        return back()->with('flash', ['message' => "User {$user->name} saved."]);
    }

    public function storeMeal(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'meal_id' => ['nullable', 'string', 'max:10', 'unique:Meals,meal_id'],
            'title' => ['required', 'string', 'max:100'],
            'thumbnail' => ['nullable', 'string', 'max:255'],
            'ingredients' => ['required', 'string'],
            'steps' => ['required', 'string'],
            'source' => ['nullable', Rule::in(['API', 'USER'])],
            'user_id' => ['nullable', 'string', 'exists:Users,id'],
        ]);

        $ingredients = $this->parseLines($data['ingredients']);
        $steps = $this->parseLines($data['steps']);

        $this->ensureList($ingredients, 'ingredients');
        $this->ensureList($steps, 'steps');

        $meal = DB::transaction(function () use ($data, $ingredients, $steps) {
            $meal = $this->persistMeal($data);
            $this->syncIngredients($meal, $ingredients);
            $this->syncSteps($meal, $steps);

            return $meal;
        });

        return back()->with('flash', ['message' => "Meal {$meal->title} saved."]);
    }

    public function storeFavorite(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'string', 'exists:Users,id'],
            'meal_id' => ['required', 'string', 'exists:Meals,meal_id'],
        ]);

        $favorite = $this->persistFavorite($data);

        return back()->with('flash', ['message' => "Favorite saved for {$favorite->user_id} -> {$favorite->meal_id}."]);
    }

    public function testForm()
    {
        return view('meal', [
            'users' => User::with(['meals', 'favorites.meal'])->get(),
            'meals' => Meal::with(['creator', 'ingredients', 'steps'])->get(),
            'favorites' => UserFavorite::with(['user', 'meal'])->get(),
        ]);
    }

    public function testSubmit(Request $request): RedirectResponse
    {
        $dump = [];

        DB::transaction(function () use ($request, &$dump): void {
            if ($request->filled(['name', 'email', 'password'])) {
                $dump['user'] = $this->persistUser([
                    'id' => $request->input('user_id'),
                    'name' => $request->input('name'),
                    'email' => $request->input('email'),
                    'password' => $request->input('password'),
                ])->toArray();
            }

            if ($request->filled(['meal_title', 'ingredients', 'steps'])) {
                $userIngredients = $this->parseLines($request->input('ingredients'));
                $userSteps = $this->parseLines($request->input('steps'));

                $this->ensureList($userIngredients, 'ingredients');
                $this->ensureList($userSteps, 'steps');

                $userMeal = $this->persistMeal([
                    'meal_id' => $request->input('meal_id'),
                    'title' => $request->input('meal_title'),
                    'thumbnail' => $request->input('thumbnail'),
                    'source' => 'USER',
                    'user_id' => $request->input('user_id'),
                ]);

                $this->syncIngredients($userMeal, $userIngredients);
                $this->syncSteps($userMeal, $userSteps);

                $dump['user_meal'] = $userMeal->toArray();
            }

            if ($request->filled(['fav_user_id', 'fav_meal_id'])) {
                $dump['favorite'] = $this->persistFavorite([
                    'user_id' => $request->input('fav_user_id'),
                    'meal_id' => $request->input('fav_meal_id'),
                ])->toArray();
            }

            if ($request->filled(['api_title', 'api_ingredients', 'api_steps'])) {
                $apiIngredients = $this->parseLines($request->input('api_ingredients'));
                $apiSteps = $this->parseLines($request->input('api_steps'));

                $this->ensureList($apiIngredients, 'api_ingredients');
                $this->ensureList($apiSteps, 'api_steps');

                $apiMeal = $this->persistMeal([
                    'meal_id' => $request->input('api_meal_id'),
                    'title' => $request->input('api_title'),
                    'thumbnail' => $request->input('api_thumbnail'),
                    'source' => 'API',
                ]);

                $this->syncIngredients($apiMeal, $apiIngredients);
                $this->syncSteps($apiMeal, $apiSteps);

                $dump['api_meal'] = $apiMeal->toArray();
            }
        });

        return redirect()
            ->route('meal.test')
            ->with('success', 'Manual test data saved.')
            ->with('data_dump', json_encode($dump, JSON_PRETTY_PRINT));
    }

    private function persistUser(array $input): User
    {
        $payload = [
            'id' => $input['id'] ?? Str::upper(Str::random(10)),
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
        ];

        return User::updateOrCreate(
            ['id' => $payload['id']],
            [
                'name' => $payload['name'],
                'email' => $payload['email'],
                'password' => $payload['password'],
            ],
        );
    }

    private function persistMeal(array $input): Meal
    {
        $payload = [
            'meal_id' => $input['meal_id'] ?? Str::upper(Str::random(10)),
            'title' => $input['title'],
            'thumbnail' => $input['thumbnail'] ?? null,
            'source' => $input['source'] ?? 'USER',
            'user_id' => $input['user_id'] ?? null,
        ];

        return Meal::updateOrCreate(
            ['meal_id' => $payload['meal_id']],
            [
                'title' => $payload['title'],
                'thumbnail' => $payload['thumbnail'],
                'source' => $payload['source'],
                'user_id' => $payload['user_id'],
            ],
        );
    }

    private function persistFavorite(array $input): UserFavorite
    {
        return UserFavorite::firstOrCreate([
            'user_id' => $input['user_id'],
            'meal_id' => $input['meal_id'],
        ]);
    }

    /**
     * @return list<string>
     */
    private function parseLines(string|array|null $value): array
    {
        $items = is_array($value)
            ? $value
            : preg_split('/\r\n|\r|\n/', $value ?? '');

        return collect($items)
            ->map(fn ($line) => trim((string) $line))
            ->filter()
            ->values()
            ->all();
    }

    private function ensureList(array $items, string $field): void
    {
        if (empty($items)) {
            throw ValidationException::withMessages([
                $field => 'Please provide at least one entry.',
            ]);
        }
    }

    private function syncIngredients(Meal $meal, array $items): void
    {
        $meal->ingredients()->delete();

        $rows = collect($items)->map(fn ($ingredient) => [
            'meal_id' => $meal->meal_id,
            'ingredient' => $ingredient,
        ])->all();

        if (!empty($rows)) {
            MealIngredient::insert($rows);
        }
    }

    private function syncSteps(Meal $meal, array $items): void
    {
        $meal->steps()->delete();

        $rows = collect($items)
            ->values()
            ->map(fn ($step, $index) => [
                'meal_id' => $meal->meal_id,
                'step_number' => $index + 1,
                'step_description' => $step,
            ])->all();

        if (!empty($rows)) {
            MealStep::insert($rows);
        }
    }
}
