import { Head, useForm } from '@inertiajs/react';

const card = 'bg-white shadow rounded-lg p-6 space-y-4';
const label = 'block text-sm font-medium text-gray-600';
const input =
    'mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none';
const textarea = `${input} min-h-24`;
const button =
    'inline-flex items-center justify-center rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500';

export default function Index({ users, meals, favorites, flash }) {
    const userForm = useForm({
        id: '',
        name: '',
        email: '',
        password: '',
    });

    const mealForm = useForm({
        meal_id: '',
        title: '',
        thumbnail: '',
        ingredients: '',
        steps: '',
        source: 'USER',
        user_id: '',
    });

    const apiMealForm = useForm({
        meal_id: '',
        title: '',
        thumbnail: '',
        ingredients: '',
        steps: '',
        source: 'API',
    });

    const favoriteForm = useForm({
        user_id: '',
        meal_id: '',
    });

    const submitUser = (e) => {
        e.preventDefault();
        userForm.post('/users', {
            preserveScroll: true,
            onSuccess: () => userForm.reset('id', 'name', 'email', 'password'),
        });
    };

    const submitMeal = (e) => {
        e.preventDefault();
        mealForm.post('/meals', {
            preserveScroll: true,
            onSuccess: () =>
                mealForm.reset('meal_id', 'title', 'thumbnail', 'ingredients', 'steps', 'user_id'),
        });
    };

    const submitApiMeal = (e) => {
        e.preventDefault();
        apiMealForm.post('/meals', {
            preserveScroll: true,
            onSuccess: () =>
                apiMealForm.reset('meal_id', 'title', 'thumbnail', 'ingredients', 'steps'),
        });
    };

    const submitFavorite = (e) => {
        e.preventDefault();
        favoriteForm.post('/favorites', {
            preserveScroll: true,
            onSuccess: () => favoriteForm.reset(),
        });
    };

    const renderError = (error) =>
        error ? <p className="text-sm text-red-500">{error}</p> : null;

    return (
        <>
            <Head title="Meal Console" />
            <div className="min-h-screen bg-gray-100">
                <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
                    <header className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">Meal Data Console</h1>
                        <p className="text-gray-600">
                            Use these forms to create users, meals, and favorites via Inertia + React.
                        </p>
                        {flash?.message && (
                            <div className="rounded border border-green-200 bg-green-50 px-4 py-2 text-green-800">
                                {flash.message}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-red-800">
                                {flash.error}
                            </div>
                        )}
                    </header>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <form onSubmit={submitUser} className={card}>
                            <h2 className="text-xl font-semibold text-gray-800">Create User</h2>
                            <div>
                                <label className={label}>User ID (optional)</label>
                                <input
                                    className={input}
                                    value={userForm.data.id}
                                    onChange={(e) => userForm.setData('id', e.target.value)}
                                    placeholder="Leave blank to auto-generate"
                                    maxLength={10}
                                />
                                {renderError(userForm.errors.id)}
                            </div>
                            <div>
                                <label className={label}>Name</label>
                                <input
                                    className={input}
                                    value={userForm.data.name}
                                    onChange={(e) => userForm.setData('name', e.target.value)}
                                />
                                {renderError(userForm.errors.name)}
                            </div>
                            <div>
                                <label className={label}>Email</label>
                                <input
                                    className={input}
                                    type="email"
                                    value={userForm.data.email}
                                    onChange={(e) => userForm.setData('email', e.target.value)}
                                />
                                {renderError(userForm.errors.email)}
                            </div>
                            <div>
                                <label className={label}>Password</label>
                                <input
                                    className={input}
                                    type="password"
                                    value={userForm.data.password}
                                    onChange={(e) => userForm.setData('password', e.target.value)}
                                />
                                {renderError(userForm.errors.password)}
                            </div>
                            <button className={button} disabled={userForm.processing}>
                                {userForm.processing ? 'Saving…' : 'Save User'}
                            </button>
                        </form>

                        <form onSubmit={submitMeal} className={card}>
                            <h2 className="text-xl font-semibold text-gray-800">Create User Meal</h2>
                            <div>
                                <label className={label}>Meal ID (optional)</label>
                                <input
                                    className={input}
                                    value={mealForm.data.meal_id}
                                    onChange={(e) => mealForm.setData('meal_id', e.target.value)}
                                    maxLength={10}
                                />
                                {renderError(mealForm.errors.meal_id)}
                            </div>
                            <div>
                                <label className={label}>Title</label>
                                <input
                                    className={input}
                                    value={mealForm.data.title}
                                    onChange={(e) => mealForm.setData('title', e.target.value)}
                                />
                                {renderError(mealForm.errors.title)}
                            </div>
                            <div>
                                <label className={label}>Thumbnail URL</label>
                                <input
                                    className={input}
                                    value={mealForm.data.thumbnail}
                                    onChange={(e) => mealForm.setData('thumbnail', e.target.value)}
                                />
                                {renderError(mealForm.errors.thumbnail)}
                            </div>
                            <div>
                                <label className={label}>Ingredients</label>
                                <textarea
                                    className={textarea}
                                    value={mealForm.data.ingredients}
                                    onChange={(e) => mealForm.setData('ingredients', e.target.value)}
                                    placeholder={'e.g.\n2 cups flour\n1 tsp salt'}
                                />
                                {renderError(mealForm.errors.ingredients)}
                                <p className="text-xs text-gray-500">Enter one ingredient per line.</p>
                            </div>
                            <div>
                                <label className={label}>Steps</label>
                                <textarea
                                    className={textarea}
                                    value={mealForm.data.steps}
                                    onChange={(e) => mealForm.setData('steps', e.target.value)}
                                    placeholder={'e.g.\nPreheat oven to 375F\nMix dry ingredients'}
                                />
                                {renderError(mealForm.errors.steps)}
                                <p className="text-xs text-gray-500">Enter one step per line.</p>
                            </div>
                            <div>
                                <label className={label}>User ID (creator)</label>
                                <input
                                    className={input}
                                    value={mealForm.data.user_id}
                                    onChange={(e) => mealForm.setData('user_id', e.target.value)}
                                    maxLength={10}
                                />
                                {renderError(mealForm.errors.user_id)}
                            </div>
                            <button className={button} disabled={mealForm.processing}>
                                {mealForm.processing ? 'Saving…' : 'Save Meal'}
                            </button>
                        </form>

                        <form onSubmit={submitApiMeal} className={card}>
                            <h2 className="text-xl font-semibold text-gray-800">Store API Meal</h2>
                            <div>
                                <label className={label}>Meal ID (optional)</label>
                                <input
                                    className={input}
                                    value={apiMealForm.data.meal_id}
                                    onChange={(e) => apiMealForm.setData('meal_id', e.target.value)}
                                    maxLength={10}
                                />
                                {renderError(apiMealForm.errors.meal_id)}
                            </div>
                            <div>
                                <label className={label}>Title</label>
                                <input
                                    className={input}
                                    value={apiMealForm.data.title}
                                    onChange={(e) => apiMealForm.setData('title', e.target.value)}
                                />
                                {renderError(apiMealForm.errors.title)}
                            </div>
                            <div>
                                <label className={label}>Thumbnail URL</label>
                                <input
                                    className={input}
                                    value={apiMealForm.data.thumbnail}
                                    onChange={(e) => apiMealForm.setData('thumbnail', e.target.value)}
                                />
                                {renderError(apiMealForm.errors.thumbnail)}
                            </div>
                            <div>
                                <label className={label}>Ingredients</label>
                                <textarea
                                    className={textarea}
                                    value={apiMealForm.data.ingredients}
                                    onChange={(e) =>
                                        apiMealForm.setData('ingredients', e.target.value)
                                    }
                                    placeholder={'API ingredient lines...'}
                                />
                                {renderError(apiMealForm.errors.ingredients)}
                                <p className="text-xs text-gray-500">One ingredient per line.</p>
                            </div>
                            <div>
                                <label className={label}>Steps</label>
                                <textarea
                                    className={textarea}
                                    value={apiMealForm.data.steps}
                                    onChange={(e) => apiMealForm.setData('steps', e.target.value)}
                                    placeholder={'API step lines...'}
                                />
                                {renderError(apiMealForm.errors.steps)}
                                <p className="text-xs text-gray-500">One step per line.</p>
                            </div>
                            <button className={button} disabled={apiMealForm.processing}>
                                {apiMealForm.processing ? 'Saving…' : 'Save API Meal'}
                            </button>
                        </form>

                        <form onSubmit={submitFavorite} className={card}>
                            <h2 className="text-xl font-semibold text-gray-800">Add Favorite</h2>
                            <div>
                                <label className={label}>User ID</label>
                                <input
                                    className={input}
                                    value={favoriteForm.data.user_id}
                                    onChange={(e) => favoriteForm.setData('user_id', e.target.value)}
                                    maxLength={10}
                                />
                                {renderError(favoriteForm.errors.user_id)}
                            </div>
                            <div>
                                <label className={label}>Meal ID</label>
                                <input
                                    className={input}
                                    value={favoriteForm.data.meal_id}
                                    onChange={(e) => favoriteForm.setData('meal_id', e.target.value)}
                                    maxLength={10}
                                />
                                {renderError(favoriteForm.errors.meal_id)}
                            </div>
                            <button className={button} disabled={favoriteForm.processing}>
                                {favoriteForm.processing ? 'Saving…' : 'Save Favorite'}
                            </button>
                        </form>
                    </div>

                    <section className={card}>
                        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="text-gray-500">
                                        <th className="px-2 py-1">ID</th>
                                        <th className="px-2 py-1">Name</th>
                                        <th className="px-2 py-1">Email</th>
                                        <th className="px-2 py-1">Meals</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-t">
                                            <td className="px-2 py-1 font-mono text-xs">{user.id}</td>
                                            <td className="px-2 py-1">{user.name}</td>
                                            <td className="px-2 py-1">{user.email}</td>
                                            <td className="px-2 py-1 text-gray-600">
                                                {user.meals.length
                                                    ? user.meals.map((meal) => meal.title).join(', ')
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {!users.length && (
                                        <tr>
                                            <td className="px-2 py-3 text-center text-gray-500" colSpan={4}>
                                                No users yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className={card}>
                        <h2 className="text-xl font-semibold text-gray-800">Meals</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="text-gray-500">
                                        <th className="px-2 py-1">Meal ID</th>
                                        <th className="px-2 py-1">Title</th>
                                        <th className="px-2 py-1">Source</th>
                                        <th className="px-2 py-1">Created By</th>
                                        <th className="px-2 py-1">Ingredients</th>
                                        <th className="px-2 py-1">Steps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meals.map((meal) => (
                                        <tr key={meal.meal_id} className="border-t">
                                            <td className="px-2 py-1 font-mono text-xs">
                                                {meal.meal_id}
                                            </td>
                                            <td className="px-2 py-1">{meal.title}</td>
                                            <td className="px-2 py-1">{meal.source}</td>
                                            <td className="px-2 py-1">
                                                {meal.creator ? meal.creator.name : 'N/A'}
                                            </td>
                                            <td className="px-2 py-1 text-sm text-gray-600">
                                                {meal.ingredients.length ? (
                                                    <ul className="list-disc pl-4">
                                                        {meal.ingredients.map((item) => (
                                                            <li key={`${meal.meal_id}-${item.id}`}>
                                                                {item.ingredient}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-2 py-1 text-sm text-gray-600">
                                                {meal.steps.length ? (
                                                    <ol className="list-decimal pl-4">
                                                        {meal.steps.map((step) => (
                                                            <li key={`${meal.meal_id}-step-${step.id}`}>
                                                                {step.step_description}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!meals.length && (
                                        <tr>
                                            <td className="px-2 py-3 text-center text-gray-500" colSpan={6}>
                                                No meals yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className={card}>
                        <h2 className="text-xl font-semibold text-gray-800">Favorites</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="text-gray-500">
                                        <th className="px-2 py-1">User ID</th>
                                        <th className="px-2 py-1">Meal ID</th>
                                        <th className="px-2 py-1">Meal Title</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {favorites.map((favorite) => (
                                        <tr key={`${favorite.user_id}-${favorite.meal_id}`} className="border-t">
                                            <td className="px-2 py-1 font-mono text-xs">
                                                {favorite.user_id}
                                            </td>
                                            <td className="px-2 py-1 font-mono text-xs">
                                                {favorite.meal_id}
                                            </td>
                                            <td className="px-2 py-1">
                                                {favorite.meal ? favorite.meal.title : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    {!favorites.length && (
                                        <tr>
                                            <td className="px-2 py-3 text-center text-gray-500" colSpan={3}>
                                                No favorites yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

