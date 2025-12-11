import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import route from '@/route';

export default function MealDetails({ auth, meal, flash }) {
    const { post, processing } = useForm({
        meal_id: meal?.meal_id || '',
    });

    const handleAddFavorite = () => {
        post(route('favorites.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout auth={auth} header="Meal Details">
            <Head title={meal?.title || 'Meal Details'} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
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
                    </AnimatePresence>

                    <AnimatePresence>
                        {meal && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white overflow-hidden shadow-sm sm:rounded-lg"
                            >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900">{meal.title}</h1>
                                    <motion.button
                                        onClick={handleAddFavorite}
                                        disabled={processing}
                                        whileHover={{ scale: processing ? 1 : 1.05 }}
                                        whileTap={{ scale: processing ? 1 : 0.95 }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Adding...' : 'Add to Favorites'}
                                    </motion.button>
                                </div>

                                {meal.thumbnail && (
                                    <img
                                        src={meal.thumbnail}
                                        alt={meal.title}
                                        className="w-full h-64 object-cover rounded-lg mb-6"
                                    />
                                )}

                                {meal.ingredients && meal.ingredients.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="mb-6"
                                    >
                                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Ingredients</h2>
                                        <ul className="list-disc list-inside space-y-2">
                                            {meal.ingredients.map((ingredient, index) => (
                                                <motion.li
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    className="text-gray-700"
                                                >
                                                    {ingredient.ingredient}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}

                                {meal.steps && meal.steps.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                    >
                                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Instructions</h2>
                                        <ol className="list-decimal list-inside space-y-3">
                                            {meal.steps
                                                .sort((a, b) => a.step_number - b.step_number)
                                                .map((step) => (
                                                    <motion.li
                                                        key={step.step_number}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: step.step_number * 0.1 }}
                                                        className="text-gray-700"
                                                    >
                                                        {step.step_description}
                                                    </motion.li>
                                                ))}
                                        </ol>
                                    </motion.div>
                                )}

                                <div className="mt-6">
                                    <Link
                                        href={route('dashboard')}
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        ← Back to Dashboard
                                    </Link>
                                </div>
                            </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

