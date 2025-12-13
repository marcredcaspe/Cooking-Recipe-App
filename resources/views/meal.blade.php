<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manual Meal Tester</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        section { border: 1px solid #ddd; padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; }
        label { display: block; margin-bottom: 0.5rem; }
        input, textarea { width: 100%; padding: 0.35rem; margin-bottom: 1rem; }
        textarea { min-height: 80px; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
        pre { background: #f5f5f5; padding: 1rem; overflow: auto; }
    </style>
</head>
<body>
    <h1>Manual Meal Tester</h1>

    <form action="{{ route('meal.testSubmit') }}" method="POST">
        @csrf

        <section>
            <h2>Create User</h2>
            <label>User ID (optional, max 10 chars)
                <input type="text" name="user_id" maxlength="10" placeholder="Leave blank to auto-generate">
            </label>
            <label>Name
                <input type="text" name="name" required>
            </label>
            <label>Email
                <input type="email" name="email" required>
            </label>
            <label>Password
                <input type="password" name="password" required>
            </label>
        </section>

        <section>
            <h2>Add User Meal</h2>
            <label>Meal ID (optional, max 10 chars)
                <input type="text" name="meal_id" maxlength="10">
            </label>
            <label>Meal Title
                <input type="text" name="meal_title">
            </label>
            <label>Thumbnail URL
                <input type="text" name="thumbnail">
            </label>
            <label>Ingredients (one per line)
                <textarea name="ingredients" placeholder="e.g.&#10;2 cups flour&#10;1 tsp salt"></textarea>
            </label>
            <label>Steps (one per line)
                <textarea name="steps" placeholder="e.g.&#10;Preheat oven to 375F&#10;Mix dry ingredients"></textarea>
            </label>
        </section>

        <section>
            <h2>Add Favorite Meal</h2>
            <label>User ID
                <input type="text" name="fav_user_id" maxlength="10">
            </label>
            <label>Meal ID
                <input type="text" name="fav_meal_id" maxlength="10">
            </label>
        </section>

        <section>
            <h2>Add API Meal</h2>
            <label>API Meal ID (optional)
                <input type="text" name="api_meal_id" maxlength="10">
            </label>
            <label>API Meal Title
                <input type="text" name="api_title">
            </label>
            <label>API Thumbnail URL
                <input type="text" name="api_thumbnail">
            </label>
            <label>API Ingredients (one per line)
                <textarea name="api_ingredients" placeholder="Ingredient lines..."></textarea>
            </label>
            <label>API Steps (one per line)
                <textarea name="api_steps" placeholder="Step lines..."></textarea>
            </label>
        </section>

        <button type="submit">Run Manual Inserts</button>
    </form>

    @if(session('success'))
        <h2>{{ session('success') }}</h2>
        <pre>{{ session('data_dump') }}</pre>
    @endif

    <section>
        <h2>Current Users</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Meals</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($users as $user)
                    <tr>
                        <td>{{ $user->id }}</td>
                        <td>{{ $user->name }}</td>
                        <td>{{ $user->email }}</td>
                        <td>{{ $user->meals->pluck('title')->join(', ') ?: '—' }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4">No users yet.</td></tr>
                @endforelse
            </tbody>
        </table>
    </section>

    <section>
        <h2>Current Meals</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Source</th>
                    <th>Owner</th>
                    <th>Ingredients</th>
                    <th>Steps</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($meals as $meal)
                    <tr>
                        <td>{{ $meal->meal_id }}</td>
                        <td>
                        {{ $meal->title }}<br>
                        @if($meal->thumbnail)
                            <img src="{{ asset(ltrim($meal->thumbnail, '/')) }}" alt="{{ $meal->title }}" style="max-width:100px; margin-top:5px;">
                         @endif
                        </td>
                        <td>{{ $meal->source }}</td>
                        <td>{{ optional($meal->creator)->name ?? 'N/A' }}</td>
                        <td>
                            <ul>
                                @forelse ($meal->ingredients as $ingredient)
                                    <li>{{ $ingredient->ingredient }}</li>
                                @empty
                                    <li>—</li>
                                @endforelse
                            </ul>
                        </td>
                        <td>
                            <ol>
                                @forelse ($meal->steps as $step)
                                    <li>{{ $step->step_description }}</li>
                                @empty
                                    <li>—</li>
                                @endforelse
                            </ol>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6">No meals yet.</td></tr>
                @endforelse
            </tbody>
        </table>
    </section>

    <section>
        <h2>Current Favorites</h2>
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Meal</th>
                    <th>Meal Title</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($favorites as $favorite)
                    <tr>
                        <td>{{ $favorite->user_id }}</td>
                        <td>{{ $favorite->meal_id }}</td>
                        <td>{{ optional($favorite->meal)->title ?? 'N/A' }}</td>
                    </tr>
                @empty
                    <tr><td colspan="3">No favorites yet.</td></tr>
                @endforelse
            </tbody>
        </table>
    </section>
</body>
</html>
