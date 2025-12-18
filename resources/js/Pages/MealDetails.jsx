import { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import route from '@/route';

export default function MealDetails({ auth, meal, flash, canEdit = false }) {
    const { post, processing } = useForm({
        meal_id: meal?.meal_id || '',
    });

    const { delete: destroy } = useForm();
    const [isEditing, setIsEditing] = useState(false);

    const updateForm = useForm({
        title: '',
        thumbnail: null,
        thumbnail_url: '',
        ingredients: '',
        steps: '',
    }, {
        transform: (data) => {
            const transformed = { ...data };
            // Remove thumbnail if it's not a File object
            if (!(transformed.thumbnail instanceof File)) {
                delete transformed.thumbnail;
            }
            return transformed;
        },
    });

    // Update form data when meal loads or when editing starts
    useEffect(() => {
        if (meal && isEditing) {
            updateForm.setData({
                title: meal.title || '',
                thumbnail: null,
                thumbnail_url: meal.thumbnail || '',
                ingredients: meal.ingredients?.map(i => i.ingredient).join('\n') || '',
                steps: meal.steps?.sort((a, b) => a.step_number - b.step_number).map(s => s.step_description).join('\n') || '',
            });
        }
    }, [meal?.meal_id, isEditing]);

    const handleAddFavorite = () => {
        post(route('favorites.store'), {
            preserveScroll: true,
        });
    };

    const handleUpdateRecipe = (e) => {
        e.preventDefault();
        // Only use FormData if there's a file to upload
        const hasFile = updateForm.data.thumbnail instanceof File;
        updateForm.put(route('recipes.update', meal.meal_id), {
            preserveScroll: true,
            forceFormData: hasFile,
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleDeleteRecipe = () => {
        if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            destroy(route('recipes.delete', meal.meal_id), {
                preserveScroll: false,
            });
        }
    };

    const handleEditToggle = () => {
        if (!isEditing && meal) {
            // Populate form with current meal data when starting to edit
            updateForm.setData({
                title: meal.title || '',
                thumbnail: null,
                thumbnail_url: meal.thumbnail || '',
                ingredients: meal.ingredients?.map(i => i.ingredient).join('\n') || '',
                steps: meal.steps?.sort((a, b) => a.step_number - b.step_number).map(s => s.step_description).join('\n') || '',
            });
        }
        setIsEditing(!isEditing);
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
                                    <div className="flex space-x-2">
                                        {canEdit && (
                                            <>
                                                <motion.button
                                                    onClick={handleEditToggle}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                                >
                                                    {isEditing ? 'Cancel Edit' : 'Edit Recipe'}
                                                </motion.button>
                                                <motion.button
                                                    onClick={handleDeleteRecipe}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </motion.button>
                                            </>
                                        )}
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
                                </div>

                                {/* Edit Form */}
                                <AnimatePresence>
                                    {isEditing && canEdit && (
                                        <motion.form
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            onSubmit={handleUpdateRecipe}
                                            className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
                                        >
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Recipe</h3>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Recipe Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={updateForm.data.title}
                                                    onChange={(e) => updateForm.setData('title', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                                                    required
                                                />
                                                {updateForm.errors.title && (
                                                    <p className="text-red-500 text-sm mt-1">{updateForm.errors.title}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Recipe Picture (Optional)
                                                </label>
                                                <div className="space-y-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => updateForm.setData('thumbnail', e.target.files[0])}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    />
                                                    <p className="text-xs text-gray-500">Or enter image URL:</p>
                                                    <input
                                                        type="text"
                                                        value={updateForm.data.thumbnail_url}
                                                        onChange={(e) => updateForm.setData('thumbnail_url', e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                                                    />
                                                </div>
                                                {updateForm.errors.thumbnail && (
                                                    <p className="text-red-500 text-sm mt-1">{updateForm.errors.thumbnail}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ingredients *
                                                </label>
                                                <textarea
                                                    value={updateForm.data.ingredients}
                                                    onChange={(e) => updateForm.setData('ingredients', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 min-h-24 focus:border-indigo-500 focus:outline-none"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Enter one ingredient per line.</p>
                                                {updateForm.errors.ingredients && (
                                                    <p className="text-red-500 text-sm mt-1">{updateForm.errors.ingredients}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Instructions *
                                                </label>
                                                <textarea
                                                    value={updateForm.data.steps}
                                                    onChange={(e) => updateForm.setData('steps', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 min-h-24 focus:border-indigo-500 focus:outline-none"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Enter one step per line.</p>
                                                {updateForm.errors.steps && (
                                                    <p className="text-red-500 text-sm mt-1">{updateForm.errors.steps}</p>
                                                )}
                                            </div>

                                            <div className="flex space-x-2">
                                                <motion.button
                                                    type="submit"
                                                    disabled={updateForm.processing}
                                                    whileHover={{ scale: updateForm.processing ? 1 : 1.05 }}
                                                    whileTap={{ scale: updateForm.processing ? 1 : 0.95 }}
                                                    className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updateForm.processing ? 'Updating...' : 'Update Recipe'}
                                                </motion.button>
                                                <motion.button
                                                    type="button"
                                                    onClick={handleEditToggle}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>

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

