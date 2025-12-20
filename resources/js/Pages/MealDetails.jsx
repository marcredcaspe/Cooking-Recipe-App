import { useState, useEffect, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
    Heart, 
    Edit3, 
    Trash2, 
    ArrowLeft, 
    ChefHat, 
    Utensils, 
    BookOpen,
    Sparkles,
    Clock,
    Users,
    Share2,
    CheckCircle2
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import route from '@/route';

export default function MealDetails({ auth, meal, flash, canEdit = false }) {
    const { post, processing } = useForm({
        meal_id: meal?.meal_id || '',
    });

    const { delete: destroy } = useForm();
    const [isEditing, setIsEditing] = useState(false);
    // Visual-only: Track if image failed to load
    const [imageError, setImageError] = useState(false);

    // Visual-only: Helper to ensure image URL is absolute
    const getImageUrl = (url) => {
        if (!url) return null;
        // If URL is already absolute, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // If URL starts with /storage/, make it absolute
        if (url.startsWith('/storage/')) {
            return window.location.origin + url;
        }
        // If URL starts with storage/, add leading slash
        if (url.startsWith('storage/')) {
            return window.location.origin + '/' + url;
        }
        // Return as is (might be relative path from asset())
        return url;
    };

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
        // Reset image error when meal changes
        setImageError(false);
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

    // Visual-only: Scroll-based parallax effect for hero image
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <AuthenticatedLayout auth={auth} header="">
            <Head title={meal?.title || 'Meal Details'} />

            {/* Visual-only: Flash messages with modern styling */}
            <AnimatePresence>
                {flash?.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 0.4 }}
                        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                            <CheckCircle2 size={24} />
                            <span className="font-semibold">{flash.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <AnimatePresence>
                    {meal && (
                        <>
                            {/* Visual-only: Hero section with parallax image */}
                            <motion.section
                                ref={heroRef}
                                className="relative h-[70vh] min-h-[500px] overflow-hidden"
                            >
                                {meal.thumbnail && !imageError ? (
                                    <motion.div
                                        style={{ y: heroY, opacity: heroOpacity }}
                                        className="absolute inset-0"
                                    >
                                        <img
                                            src={getImageUrl(meal.thumbnail)}
                                            alt={meal.title}
                                            className="w-full h-full object-cover"
                                            onError={() => {
                                                // If image fails to load, show fallback
                                                setImageError(true);
                                            }}
                                            onLoad={() => {
                                                // Reset error state if image loads successfully
                                                setImageError(false);
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    </motion.div>
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ChefHat className="text-white/30" size={120} />
                                        </div>
                                    </div>
                                )}

                                {/* Visual-only: Hero content overlay */}
                                <div className="relative z-10 h-full flex flex-col justify-end">
                                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="max-w-4xl"
                                        >
                                            {/* Visual-only: Recipe source badge */}
                                            {meal.source && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6 text-white"
                                                >
                                                    <Sparkles size={16} />
                                                    <span className="text-sm font-medium">{meal.source}</span>
                                                </motion.div>
                                            )}

                                            {/* Visual-only: Enhanced title typography */}
                                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight">
                                                {meal.title}
                                            </h1>

                                            {/* Visual-only: Action buttons with modern styling */}
                                            <div className="flex flex-wrap items-center gap-4">
                                                <motion.button
                                                    onClick={handleAddFavorite}
                                                    disabled={processing}
                                                    whileHover={{ scale: processing ? 1 : 1.05, y: -2 }}
                                                    whileTap={{ scale: processing ? 1 : 0.95 }}
                                                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Heart 
                                                        size={20} 
                                                        className={processing ? '' : 'group-hover:fill-white transition-all'} 
                                                    />
                                                    {processing ? 'Adding...' : 'Add to Favorites'}
                                                </motion.button>

                                                {canEdit && (
                                                    <>
                                                        <motion.button
                                                            onClick={handleEditToggle}
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all"
                                                        >
                                                            <Edit3 size={20} />
                                                            {isEditing ? 'Cancel Edit' : 'Edit Recipe'}
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={handleDeleteRecipe}
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="flex items-center gap-2 px-6 py-3 bg-red-500/90 backdrop-blur-md text-white font-semibold rounded-full border-2 border-red-400/50 hover:bg-red-500 transition-all"
                                                        >
                                                            <Trash2 size={20} />
                                                            Delete
                                                        </motion.button>
                                                    </>
                                                )}

                                                <Link
                                                    href={route('dashboard')}
                                                    className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all"
                                                >
                                                    <ArrowLeft size={20} />
                                                    Back
                                                </Link>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Visual-only: Scroll indicator */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
                                >
                                    <motion.div
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
                                    >
                                        <motion.div
                                            animate={{ y: [0, 12, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="w-1 h-3 bg-white/50 rounded-full mt-2"
                                        />
                                    </motion.div>
                                </motion.div>
                            </motion.section>

                            {/* Visual-only: Edit form with modern styling */}
                            <AnimatePresence>
                                {isEditing && canEdit && (
                                    <motion.section
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="bg-white border-b border-gray-200 shadow-lg"
                                    >
                                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                            <motion.form
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onSubmit={handleUpdateRecipe}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                                                        <Edit3 className="text-blue-600" size={24} />
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-gray-900">Edit Your Recipe</h3>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Recipe Title <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={updateForm.data.title}
                                                        onChange={(e) => updateForm.setData('title', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                                                        required
                                                    />
                                                    {updateForm.errors.title && (
                                                        <p className="text-red-500 text-sm mt-1">{updateForm.errors.title}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Recipe Picture (Optional)
                                                    </label>
                                                    <div className="space-y-3">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => updateForm.setData('thumbnail', e.target.files[0])}
                                                            className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        />
                                                        <p className="text-xs text-gray-500">Or enter image URL:</p>
                                                        <input
                                                            type="url"
                                                            value={updateForm.data.thumbnail_url}
                                                            onChange={(e) => updateForm.setData('thumbnail_url', e.target.value)}
                                                            placeholder="https://example.com/image.jpg"
                                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                                                        />
                                                    </div>
                                                    {updateForm.errors.thumbnail && (
                                                        <p className="text-red-500 text-sm mt-1">{updateForm.errors.thumbnail}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Ingredients <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={updateForm.data.ingredients}
                                                        onChange={(e) => updateForm.setData('ingredients', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all min-h-[120px] resize-y"
                                                        placeholder={`Enter one ingredient per line
e.g.
2 cups flour
1 tsp salt`}
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Enter one ingredient per line.</p>
                                                    {updateForm.errors.ingredients && (
                                                        <p className="text-red-500 text-sm mt-1">{updateForm.errors.ingredients}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Instructions <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={updateForm.data.steps}
                                                        onChange={(e) => updateForm.setData('steps', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all min-h-[120px] resize-y"
                                                        placeholder={`Enter one step per line
e.g.
Preheat oven to 375°F
Mix dry ingredients`}
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Enter one step per line.</p>
                                                    {updateForm.errors.steps && (
                                                        <p className="text-red-500 text-sm mt-1">{updateForm.errors.steps}</p>
                                                    )}
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <motion.button
                                                        type="submit"
                                                        disabled={updateForm.processing}
                                                        whileHover={{ scale: updateForm.processing ? 1 : 1.02, y: -2 }}
                                                        whileTap={{ scale: updateForm.processing ? 1 : 0.98 }}
                                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {updateForm.processing ? 'Updating...' : 'Update Recipe'}
                                                    </motion.button>
                                                    <motion.button
                                                        type="button"
                                                        onClick={handleEditToggle}
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </motion.button>
                                                </div>
                                            </motion.form>
                                        </div>
                                    </motion.section>
                                )}
                            </AnimatePresence>

                            {/* Visual-only: Ingredients section with narrative design */}
                            {meal.ingredients && meal.ingredients.length > 0 && (
                                <section className="py-20 bg-white">
                                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: '-100px' }}
                                            transition={{ duration: 0.6 }}
                                            className="text-center mb-16"
                                        >
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-4">
                                                <Utensils size={20} className="text-orange-600" />
                                                <span className="text-sm font-semibold text-orange-700">The Ingredients</span>
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                                Your Culinary Arsenal
                                            </h2>
                                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                                Every great dish begins with quality ingredients. Here's what you'll need to bring this recipe to life.
                                            </p>
                                        </motion.div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {meal.ingredients.map((ingredient, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: '-50px' }}
                                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                                    whileHover={{ y: -4, scale: 1.02 }}
                                                    className="group relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-100 hover:border-orange-300 transition-all shadow-sm hover:shadow-lg"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                                            <CheckCircle2 className="text-white" size={20} />
                                                        </div>
                                                        <p className="text-gray-800 font-medium text-lg leading-relaxed flex-1">
                                                            {ingredient.ingredient}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Visual-only: Instructions section with narrative design */}
                            {meal.steps && meal.steps.length > 0 && (
                                <section className="py-20 bg-gradient-to-b from-white to-orange-50">
                                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: '-100px' }}
                                            transition={{ duration: 0.6 }}
                                            className="text-center mb-16"
                                        >
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                                                <BookOpen size={20} className="text-purple-600" />
                                                <span className="text-sm font-semibold text-purple-700">The Journey</span>
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                                Your Culinary Journey
                                            </h2>
                                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                                Follow these steps to transform ingredients into a masterpiece. Each step brings you closer to perfection.
                                            </p>
                                        </motion.div>

                                        <div className="space-y-6">
                                            {meal.steps
                                                .sort((a, b) => a.step_number - b.step_number)
                                                .map((step, index) => (
                                                    <motion.div
                                                        key={step.step_number}
                                                        initial={{ opacity: 0, x: -30 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true, margin: '-50px' }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                        whileHover={{ x: 8 }}
                                                        className="group relative"
                                                    >
                                                        <div className="flex gap-6">
                                                            {/* Visual-only: Step number badge */}
                                                            <div className="flex-shrink-0">
                                                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                                    <span className="text-2xl font-bold text-white">
                                                                        {step.step_number}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Visual-only: Step content card */}
                                                            <div className="flex-1 bg-white rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-xl">
                                                                <p className="text-gray-800 text-lg leading-relaxed">
                                                                    {step.step_description}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Visual-only: Connecting line between steps */}
                                                        {index < meal.steps.length - 1 && (
                                                            <div className="absolute left-8 top-16 w-0.5 h-6 bg-gradient-to-b from-purple-300 to-pink-300"></div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Visual-only: Call to action footer */}
                            <section className="py-20 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
                                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                                            <ChefHat className="text-white" size={48} />
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                            Ready to Create Magic?
                                        </h2>
                                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                            Now that you've discovered this recipe, why not explore more culinary adventures?
                                        </p>
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                                        >
                                            <ArrowLeft size={20} />
                                            Return to Dashboard
                                        </Link>
                                    </motion.div>
                                </div>
                            </section>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </AuthenticatedLayout>
    );
}

