import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import route from '@/route';

export default function Dashboard({
    auth,
    favorites,
    userMeals,
    flash,
    randomRecipe,
    dateFilter = '',
    favoriteSearch = '',
    recipeSearch = '',
    searchResults = []
}) {
    const { delete: destroy } = useForm();
    const [showRandomRecipe, setShowRandomRecipe] = useState(!!randomRecipe);
    const [showRecipeForm, setShowRecipeForm] = useState(false);
    const [isAddingFavorite, setIsAddingFavorite] = useState(false);

    const [favoriteSearchTerm, setFavoriteSearchTerm] = useState(favoriteSearch);
    const [recipeSearchTerm, setRecipeSearchTerm] = useState(recipeSearch);

    const recipeForm = useForm({
        title: '',
        thumbnail: null,
        thumbnail_url: '',
        ingredients: '',
        steps: '',
    }, {
        transform: (data) => {
            const d = { ...data };
            if (!(d.thumbnail instanceof File)) delete d.thumbnail;
            return d;
        }
    });

    const handleGetRandomRecipe = () => {
        router.visit(route('dashboard.random'), {
            preserveScroll: true,
            onSuccess: () => setShowRandomRecipe(true),
        });
    };

    const handleAddRandomToFavorites = () => {
        if (!isAddingFavorite && randomRecipe?.meal_id) {
            setIsAddingFavorite(true);
            router.post(route('favorites.store'), {
                meal_id: randomRecipe.meal_id
            }, {
                preserveScroll: true,
                onFinish: () => setIsAddingFavorite(false),
            });
        }
    };

    const handleSubmitRecipe = (e) => {
        e.preventDefault();
        recipeForm.post(route('recipes.store'), {
            preserveScroll: true,
            forceFormData: recipeForm.data.thumbnail instanceof File,
            onSuccess: () => {
                recipeForm.reset();
                setShowRecipeForm(false);
            }
        });
    };

    const handleRemoveFavorite = (id) => {
        if (confirm('Remove from favorites?')) {
            destroy(route('favorites.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Dashboard" />

            {/* FLASH MESSAGE */}
            <AnimatePresence>
                {flash?.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded shadow"
                    >
                        {flash.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SECTION 1 – HERO (TOP BUN) */}
            <section
                className="min-h-screen flex items-center justify-center text-white text-center px-6"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .8 }}
                >
                    <h1 className="text-6xl font-extrabold mb-6">
                        Your Recipe Story Begins
                    </h1>
                    <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                        Every scroll adds a layer — discover, collect, and create flavors.
                    </p>
                </motion.div>
            </section>

            {/* SECTION 2 – DISCOVER RECIPES (TOP BUN COLOR) */}
            <section className="bg-amber-200 py-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Discover Recipes</h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.get(route('dashboard'), {
                                recipe_search: recipeSearchTerm
                            }, { preserveScroll: true });
                        }}
                        className="flex justify-center gap-2 mb-10"
                    >
                        <input
                            value={recipeSearchTerm}
                            onChange={(e) => setRecipeSearchTerm(e.target.value)}
                            placeholder="Search recipes..."
                            className="px-4 py-3 rounded w-64"
                        />
                        <button className="px-6 py-3 bg-white rounded font-semibold">
                            Search
                        </button>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map(meal => (
                                <Link
                                    key={meal.meal_id}
                                    href={route('meal.details', meal.meal_id)}
                                    className="bg-white rounded shadow hover:shadow-xl transition"
                                >
                                    <img
                                        src={meal.thumbnail}
                                        className="h-48 w-full object-cover rounded-t"
                                    />
                                    <div className="p-4 font-semibold">
                                        {meal.title}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 3 – RANDOM RECIPE (LETTUCE) */}
            <section className="bg-green-200 py-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">A Surprise Bite</h2>

                    <button
                        onClick={handleGetRandomRecipe}
                        className="px-8 py-3 bg-white rounded font-semibold mb-10"
                    >
                        Get Random Recipe
                    </button>

                    {randomRecipe && showRandomRecipe && (
                        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
                            <img
                                src={randomRecipe.thumbnail}
                                className="rounded mb-4 w-full h-64 object-cover"
                            />
                            <h3 className="text-3xl font-bold mb-4">
                                {randomRecipe.title}
                            </h3>
                            <button
                                onClick={handleAddRandomToFavorites}
                                className="px-6 py-2 bg-red-500 text-white rounded"
                            >
                                Add to Favorites ❤️
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 4 – ADD RECIPE (PATTY) */}
            <section className="bg-amber-800 text-white py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold mb-6">Create Your Own</h2>

                    <button
                        onClick={() => setShowRecipeForm(!showRecipeForm)}
                        className="mb-6 px-6 py-3 bg-white text-black rounded"
                    >
                        {showRecipeForm ? 'Close Form' : 'Add Recipe'}
                    </button>

                    {showRecipeForm && (
                        <form onSubmit={handleSubmitRecipe} className="space-y-4">
                            <input
                                placeholder="Title"
                                className="w-full p-3 rounded text-black"
                                onChange={e => recipeForm.setData('title', e.target.value)}
                            />
                            <textarea
                                placeholder="Ingredients (one per line)"
                                className="w-full p-3 rounded text-black"
                                onChange={e => recipeForm.setData('ingredients', e.target.value)}
                            />
                            <textarea
                                placeholder="Steps (one per line)"
                                className="w-full p-3 rounded text-black"
                                onChange={e => recipeForm.setData('steps', e.target.value)}
                            />
                            <button className="px-6 py-3 bg-white text-black rounded">
                                Save Recipe
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* SECTION 5 – MY RECIPES (CHEESE) */}
            <section className="bg-yellow-300 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-10 text-center">
                        My Recipes
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userMeals.map(meal => (
                            <Link
                                key={meal.meal_id}
                                href={route('meal.details', meal.meal_id)}
                                className="bg-white rounded shadow"
                            >
                                <img src={meal.thumbnail} className="h-48 w-full object-cover" />
                                <div className="p-4 font-semibold">{meal.title}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 6 – FAVORITES (TOMATO) */}
            <section className="bg-red-300 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-10 text-center">
                        My Favorites
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map(fav => (
                            <div
                                key={fav.meal_id}
                                className="bg-white rounded shadow p-4"
                            >
                                <h3 className="font-semibold mb-2">
                                    {fav.meal.title}
                                </h3>
                                <div className="flex justify-between">
                                    <Link
                                        href={route('meal.details', fav.meal_id)}
                                        className="text-blue-600"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => handleRemoveFavorite(fav.meal_id)}
                                        className="text-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 7 – FINAL MESSAGE (BOTTOM BUN) */}
            <section className="bg-amber-200 py-24 text-center">
                <h2 className="text-5xl font-extrabold mb-4">
                    🍔 The Story Continues
                </h2>
                <p className="text-xl">
                    Keep cooking. Keep discovering. Keep telling your story.
                </p>
            </section>

        </AuthenticatedLayout>
    );
}
