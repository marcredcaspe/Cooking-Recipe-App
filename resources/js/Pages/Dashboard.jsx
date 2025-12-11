import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import route from '@/route';

export default function Dashboard({ auth, favorites, userMeals, flash, randomRecipe }) {
    const { delete: destroy } = useForm();
    const [showRandomRecipe, setShowRandomRecipe] = useState(!!randomRecipe);
    const [isAddingFavorite, setIsAddingFavorite] = useState(false);

    const handleRemoveFavorite = (mealId) => {
        if (confirm('Are you sure you want to remove this favorite?')) {
            destroy(route('favorites.destroy', mealId), {
                preserveScroll: true,
            });
        }
    };

    const handleGetRandomRecipe = () => {
        router.visit(route('dashboard.random'), {
            preserveScroll: true,
            onSuccess: () => setShowRandomRecipe(true),
        });
    };

    const handleAddRandomToFavorites = () => {
        if (randomRecipe?.meal_id && !isAddingFavorite) {
            setIsAddingFavorite(true);
            router.post(route('favorites.store'), {
                meal_id: randomRecipe.meal_id,
            }, {
                preserveScroll: true,
                onFinish: () => setIsAddingFavorite(false),
            });
        }
    };

    return (
        <AuthenticatedLayout auth={auth} header="Dashboard">
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AnimatePresence>
                        {flash?.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
                            >
                                {flash.message}
                            </motion.div>
                        )}

                        {flash?.error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                            >
                                {flash.error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Random Recipe Section */}
                    <div className="mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Discover Random Recipe</h2>
                                    <motion.button
                                        onClick={handleGetRandomRecipe}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                                    >
                                        🎲 Get Random Recipe
                                    </motion.button>
                                </div>

                                <AnimatePresence>
                                    {randomRecipe && showRandomRecipe && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-6 bg-gray-50 rounded-lg p-6"
                                        >
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Recipe Image and Basic Info */}
                                            <div>
                                                {randomRecipe.thumbnail && (
                                                    <img
                                                        src={randomRecipe.thumbnail}
                                                        alt={randomRecipe.title}
                                                        className="w-full h-64 object-cover rounded-lg mb-4"
                                                    />
                                                )}
                                                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                                    {randomRecipe.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {randomRecipe.category && (
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                            {randomRecipe.category}
                                                        </span>
                                                    )}
                                                    {randomRecipe.area && (
                                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                            {randomRecipe.area}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <motion.button
                                                        onClick={handleAddRandomToFavorites}
                                                        disabled={isAddingFavorite}
                                                        whileHover={{ scale: isAddingFavorite ? 1 : 1.05 }}
                                                        whileTap={{ scale: isAddingFavorite ? 1 : 0.95 }}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isAddingFavorite ? 'Adding...' : '⭐ Add to Favorites'}
                                                    </motion.button>
                                                    {randomRecipe.youtube && (
                                                        <a
                                                            href={randomRecipe.youtube}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                                        >
                                                            📺 Watch on YouTube
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ingredients and Instructions */}
                                            <div>
                                                {randomRecipe.ingredients && randomRecipe.ingredients.length > 0 && (
                                                    <div className="mb-6">
                                                        <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                                            Ingredients
                                                        </h4>
                                                        <ul className="list-disc list-inside space-y-2 bg-white p-4 rounded">
                                                            {randomRecipe.ingredients.map((item, index) => (
                                                                <motion.li
                                                                    key={index}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                                    className="text-gray-700"
                                                                >
                                                                    {item.ingredient}
                                                                </motion.li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {randomRecipe.steps && randomRecipe.steps.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                                            Instructions
                                                        </h4>
                                                        <ol className="list-decimal list-inside space-y-2 bg-white p-4 rounded">
                                                            {randomRecipe.steps.map((step) => (
                                                                <motion.li
                                                                    key={step.step_number}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ duration: 0.3, delay: step.step_number * 0.1 }}
                                                                    className="text-gray-700 mb-2"
                                                                >
                                                                    {step.step_description}
                                                                </motion.li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-4">My Favorite Recipes</h2>

                            {favorites && favorites.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    <AnimatePresence>
                                        {favorites.map((favorite, index) => (
                                            <motion.div
                                                key={favorite.meal_id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                whileHover={{ scale: 1.02, y: -5 }}
                                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                            >
                                            {favorite.meal?.thumbnail && (
                                                <img
                                                    src={favorite.meal.thumbnail}
                                                    alt={favorite.meal.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {favorite.meal?.title || 'Unknown Recipe'}
                                                </h3>
                                                <div className="mt-4 flex space-x-2">
                                                    <Link
                                                        href={route('meal.details', favorite.meal_id)}
                                                        className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <motion.button
                                                        onClick={() => handleRemoveFavorite(favorite.meal_id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                                    >
                                                        Remove
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <p className="text-gray-500">You haven't added any favorite recipes yet.</p>
                            )}
                        </div>
                    </div>

                    {userMeals && userMeals.length > 0 && (
                        <div className="mt-8 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <h2 className="text-2xl font-bold mb-4">My Recipes</h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {userMeals.map((meal) => (
                                        <Link
                                            key={meal.meal_id}
                                            href={route('meal.details', meal.meal_id)}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                        >
                                            {meal.thumbnail && (
                                                <img
                                                    src={meal.thumbnail}
                                                    alt={meal.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-900">{meal.title}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

