import { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  Heart, 
  PlusCircle, 
  Filter,
  ChefHat,
  Flame,
  BookOpen,
  TrendingUp,
  X
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import route from '@/route';
import ParticleScene from '@/Components/ParticleScene';


export default function Dashboard({ auth, favorites, userMeals, flash, randomRecipe, dateFilter = '', favoriteSearch = '', recipeSearch = '', searchResults = [] }) {
    const { delete: destroy } = useForm();
    const [showRandomRecipe, setShowRandomRecipe] = useState(!!randomRecipe);
    const [isAddingFavorite, setIsAddingFavorite] = useState(false);
    const [showRecipeForm, setShowRecipeForm] = useState(false);
    const [favoriteSearchTerm, setFavoriteSearchTerm] = useState(favoriteSearch);
    const [recipeSearchTerm, setRecipeSearchTerm] = useState(recipeSearch);
    const [activeSection, setActiveSection] = useState('discover');
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);

    const recipeForm = useForm({
        title: '',
        thumbnail: null,
        thumbnail_url: '',
        ingredients: '',
        steps: '',
    }, {
        transform: (data) => {
            const transformed = { ...data };
            if (!(transformed.thumbnail instanceof File)) {
                delete transformed.thumbnail;
            }
            return transformed;
        },
    });

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
            onSuccess: () => {
                setShowRandomRecipe(true);
                setActiveSection('surprise');
            },
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

    const handleSubmitRecipe = (e) => {
        e.preventDefault();
        const hasFile = recipeForm.data.thumbnail instanceof File;
        recipeForm.post(route('recipes.store'), {
            preserveScroll: true,
            forceFormData: hasFile,
            onSuccess: () => {
                recipeForm.reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setImagePreview(null);
                setShowRecipeForm(false);
            },
        });
    };

    const handleDateFilterChange = (filter) => {
        router.get(route('dashboard'), { 
            date_filter: filter,
            favorite_search: favoriteSearchTerm,
            recipe_search: recipeSearchTerm
        }, {
            preserveScroll: true,
        });
    };

    const handleFavoriteSearchChange = (value) => {
        setFavoriteSearchTerm(value);
    };

    const handleFavoriteSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), { 
            favorite_search: favoriteSearchTerm,
            date_filter: dateFilter,
            recipe_search: recipeSearchTerm
        }, {
            preserveScroll: true,
        });
    };

    const handleClearFavoriteSearch = () => {
        setFavoriteSearchTerm('');
        router.get(route('dashboard'), { 
            favorite_search: '',
            date_filter: dateFilter,
            recipe_search: recipeSearchTerm
        }, {
            preserveScroll: true,
        });
    };

    const handleRecipeSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), { 
            recipe_search: recipeSearchTerm,
            favorite_search: favoriteSearchTerm,
            date_filter: dateFilter
        }, {
            preserveScroll: true,
        });
    };

    const handleClearRecipeSearch = () => {
        setRecipeSearchTerm('');
        router.get(route('dashboard'), { 
            recipe_search: '',
            favorite_search: favoriteSearchTerm,
            date_filter: dateFilter
        }, {
            preserveScroll: true,
        });
    };

    // Calculate stats for narrative
    const totalFavorites = favorites?.length || 0;
    const totalRecipes = userMeals?.length || 0;
    const recentlyAdded = favorites?.filter(f => {
        const date = new Date(f.created_at);
        const now = new Date();
        return (now - date) < 7 * 24 * 60 * 60 * 1000; // Last 7 days
    }).length || 0;

    // Visual-only: Container ref for animations
    const containerRef = useRef(null);

    // Visual-only: Animation variants for narrative-driven reveals
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut'
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: 'easeOut'
            }
        },
        hover: {
            scale: 1.03,
            y: -5,
            transition: {
                duration: 0.2
            }
        }
    };


    const NavigationPill = ({ id, icon: Icon, label, isActive, onClick }) => (
        <motion.button
            onClick={() => {
                onClick();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                isActive 
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg' 
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 border border-gray-200'
            }`}
        >
            <motion.div
                animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
                <Icon size={18} />
            </motion.div>
            <span className="font-medium">{label}</span>
        </motion.button>
    );

    return (
        <AuthenticatedLayout auth={auth} header="">
            <Head title="Dashboard" />

            {/* Visual-only: Premium muted background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-stone-50 to-neutral-50" />
            </div>



            {/* Visual-only: Enhanced main content area with premium muted gradient background */}
            <div ref={containerRef} className="min-h-screen relative">
                {/* Visual-only: Subtle animated gradient overlay for content area */}
                <div className="fixed inset-0 -z-10 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 via-stone-50/80 to-neutral-50/90"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10"></div>
                </div>
                {/* Floating Navigation */}
                <motion.nav
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-lg"
                >
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ChefHat className="text-orange-700" size={24} />
                                <span className="text-xl font-bold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
                                    Culinary Journey
                                </span>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto py-2">
                                <NavigationPill
                                    id="discover"
                                    icon={Search}
                                    label="Discover"
                                    isActive={activeSection === 'discover'}
                                    onClick={() => setActiveSection('discover')}
                                />
                                <NavigationPill
                                    id="surprise"
                                    icon={Sparkles}
                                    label="Surprise Me"
                                    isActive={activeSection === 'surprise'}
                                    onClick={() => setActiveSection('surprise')}
                                />
                                <NavigationPill
                                    id="create"
                                    icon={PlusCircle}
                                    label="Create"
                                    isActive={activeSection === 'create'}
                                    onClick={() => setActiveSection('create')}
                                />
                                <NavigationPill
                                    id="my-recipes"
                                    icon={BookOpen}
                                    label="My Recipes"
                                    isActive={activeSection === 'my-recipes'}
                                    onClick={() => setActiveSection('my-recipes')}
                                />
                                <NavigationPill
                                    id="favorites"
                                    icon={Heart}
                                    label="Favorites"
                                    isActive={activeSection === 'favorites'}
                                    onClick={() => setActiveSection('favorites')}
                                />
                            </div>
                        </div>
                    </div>
                </motion.nav>

                {/* Flash Messages */}
                <AnimatePresence>
                    {flash?.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
                        >
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
                                <Sparkles size={20} />
                                <span className="font-medium">{flash.message}</span>
                            </div>
                        </motion.div>
                    )}

                    {flash?.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
                        >
                            <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
                                <X size={20} />
                                <span className="font-medium">{flash.error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden"
                >
                    {/* Subtle particles in hero section */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <ParticleScene interactive={false} />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="inline-block p-3 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl mb-6 shadow-lg"
                            >
                                <ChefHat size={48} className="text-white" />
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6">
                                <span className="bg-gradient-to-r from-orange-700 via-amber-700 to-orange-800 bg-clip-text text-transparent">
                                    Your Culinary Odyssey
                                </span>
                            </h1>
                            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                                Embark on a journey of flavor discovery, creation, and mastery. 
                                Every recipe tells a story—start writing yours.
                            </p>
                            
                            {/* Stats Cards */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-wrap justify-center gap-4 mb-12"
                            >
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white/90 rounded-xl p-4 shadow-lg border border-gray-200 backdrop-blur-sm hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <BookOpen className="text-orange-700" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Recipes Created</p>
                                            <p className="text-2xl font-bold text-gray-900">{totalRecipes}</p>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white/90 rounded-xl p-4 shadow-lg border border-gray-200 backdrop-blur-sm hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <Heart className="text-amber-700" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Favorites</p>
                                            <p className="text-2xl font-bold text-gray-900">{totalFavorites}</p>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white/90 rounded-xl p-4 shadow-lg border border-gray-200 backdrop-blur-sm hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <TrendingUp className="text-orange-700" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Recent Adds</p>
                                            <p className="text-2xl font-bold text-gray-900">{recentlyAdded}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-3xl opacity-20" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-200/30 to-transparent rounded-full blur-3xl opacity-20" />
                </motion.section>

                {/* Discover Recipes - Chapter 1: Premium Darker Orange/Amber Theme */}
                <section id="discover" className="scroll-mt-24 relative overflow-hidden">
                    {/* Visual-only: Premium darker orange/amber background for discover section */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-amber-200 to-orange-200"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-300/70 via-transparent to-amber-300/60"></div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/40 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/40 rounded-full blur-3xl"></div>
                    {/* Infinite Scrolling Encouragement Text */}
                    <div className="relative z-10 border-y border-orange-300/30 bg-orange-200/40 backdrop-blur-sm overflow-hidden">
                        <div className="py-3">
                            <motion.div
                                className="flex whitespace-nowrap"
                                animate={{
                                    x: ["0%", "-50%"]
                                }}
                                transition={{
                                    x: {
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        duration: 60,
                                        ease: "linear"
                                    }
                                }}
                            >
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-8 px-8">
                                        <span className="text-sm md:text-base text-orange-800/80 font-medium">✨ Every recipe is a new adventure</span>
                                        <span className="text-orange-600/40">•</span>
                                        <span className="text-sm md:text-base text-orange-800/80 font-medium">🍳 Cook with passion, eat with joy</span>
                                        <span className="text-orange-600/40">•</span>
                                        <span className="text-sm md:text-base text-orange-800/80 font-medium">👨‍🍳 Your kitchen, your canvas</span>
                                        <span className="text-orange-600/40">•</span>
                                        <span className="text-sm md:text-base text-orange-800/80 font-medium">🌶️ Spice up your life, one dish at a time</span>
                                        <span className="text-orange-600/40">•</span>
                                        <span className="text-sm md:text-base text-orange-800/80 font-medium">🥘 Flavors that tell stories</span>
                                        <span className="text-orange-600/40">•</span>
                                        <span className="text-sm md:text-base text-orange-800/80 font-medium">🍽️ Discover, create, savor</span>
                                        <span className="text-orange-600/40">•</span>
                                        <span className="text-sm md:text-base text-orange-800/80 font-medium">🌟 Every meal is a masterpiece</span>
                                        <span className="text-orange-600/40">•</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-4 border border-orange-200">
                                <Search size={16} className="text-orange-700" />
                                <span className="text-sm font-medium text-orange-800">Chapter 1</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Discover Hidden Gems
                            </h2>
                            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                                Unearth culinary treasures from around the world. Every search is an adventure.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="max-w-2xl mx-auto mb-12"
                        >
                            <form onSubmit={handleRecipeSearchSubmit} className="relative">
                                <motion.div
                                    whileFocus={{ scale: 1.02 }}
                                    className="relative"
                                >
                                    <motion.div
                                        animate={recipeSearchTerm ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    </motion.div>
                                    <motion.input
                                        type="text"
                                        value={recipeSearchTerm}
                                        onChange={(e) => setRecipeSearchTerm(e.target.value)}
                                        placeholder="What flavors are you craving today?"
                                        className="w-full pl-12 pr-12 py-4 text-lg rounded-2xl border-2 border-orange-200 bg-white/80 backdrop-blur-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                                        whileFocus={{ 
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(249, 115, 22, 0.2)"
                                        }}
                                    />
                                    {recipeSearchTerm && (
                                        <button
                                            type="button"
                                            onClick={handleClearRecipeSearch}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </motion.div>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-xl transition-shadow glow-orange"
                                >
                                    Explore
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* Search Results */}
                        {recipeSearch && searchResults && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-16"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Found {searchResults.length} Gem{searchResults.length !== 1 ? 's' : ''}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        "{recipeSearch}"
                                    </span>
                                </div>
                                
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {searchResults.map((meal, index) => (
                                        <motion.div
                                            key={meal.meal_id}
                                            variants={cardVariants}
                                            whileHover="hover"
                                            className="group bg-gradient-to-br from-white to-orange-50/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 backdrop-blur-sm"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                {meal.thumbnail ? (
                                                    <img
                                                        src={meal.thumbnail}
                                                        alt={meal.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                                        <ChefHat className="text-orange-300" size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                            
                                            <div className="p-6">
                                                <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                                    {meal.title}
                                                </h4>
                                                
                                                <div className="flex items-center justify-between mb-4">
                                                    {meal.source && (
                                                        <span className="text-sm text-gray-500">
                                                            {meal.source}
                                                        </span>
                                                    )}
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                                        Discovered
                                                    </span>
                                                </div>
                                                
                                                <Link
                                                    href={route('meal.details', meal.meal_id)}
                                                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all"
                                                >
                                                    Uncover Recipe
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* Random Recipe & Creation - Mixed Theme Container */}
                <div className="relative overflow-hidden">
                    {/* Visual-only: Subtle background for container */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-gray-50/20 to-stone-50/15"></div>
                    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            {/* Surprise Me Section - Chapter 2: Premium Darker Purple/Pink Theme */}
                            <section id="surprise" className="scroll-mt-24 relative overflow-hidden rounded-3xl p-8 self-start">
                                {/* Visual-only: Premium darker purple/pink background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-rose-200 rounded-3xl"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-300/70 via-transparent to-pink-300/60 rounded-3xl"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/40 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/40 rounded-full blur-3xl"></div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="relative z-10"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                                            <Sparkles className="text-purple-600" size={24} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-purple-700">Chapter 2</span>
                                            <h2 className="text-3xl font-bold text-gray-900">Culinary Surprise</h2>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-8">
                                        Let fate decide your next culinary adventure. Sometimes the best recipes are the ones we never expected.
                                    </p>
                                    
                                    <motion.button
                                        onClick={handleGetRandomRecipe}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-3 glow-purple"
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                        >
                                            <Sparkles size={20} />
                                        </motion.div>
                                        Reveal Your Culinary Destiny
                                    </motion.button>

                                    <AnimatePresence>
                                        {randomRecipe && showRandomRecipe && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-8"
                                            >
                                                <div className="bg-gradient-to-br from-white to-purple-50/20 rounded-2xl shadow-xl overflow-hidden border border-purple-100 backdrop-blur-sm">
                                                    <div className="relative h-48 overflow-hidden">
                                                        {randomRecipe.thumbnail && (
                                                            <img
                                                                src={randomRecipe.thumbnail}
                                                                alt={randomRecipe.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                        <div className="absolute top-4 right-4">
                                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-sm font-medium rounded-full">
                                                                Surprise!
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-6">
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                                            {randomRecipe.title}
                                                        </h3>
                                                        
                                                        <div className="flex flex-wrap gap-2 mb-6">
                                                            {randomRecipe.category && (
                                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                                                                    {randomRecipe.category}
                                                                </span>
                                                            )}
                                                            {randomRecipe.area && (
                                                                <span className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full">
                                                                    {randomRecipe.area}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="space-y-4">
                                                            <motion.button
                                                                onClick={handleAddRandomToFavorites}
                                                                disabled={isAddingFavorite}
                                                                whileHover={isAddingFavorite ? {} : { scale: 1.05, y: -2 }}
                                                                whileTap={isAddingFavorite ? {} : { scale: 0.98 }}
                                                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2 glow-purple"
                                                            >
                                                                {isAddingFavorite ? (
                                                                    <>Adding to Treasure Chest...</>
                                                                ) : (
                                                                    <>
                                                                        <Heart size={18} />
                                                                        Claim This Treasure
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                            
                                                            {randomRecipe.youtube && (
                                                                <a
                                                                    href={randomRecipe.youtube}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow text-center"
                                                                >
                                                                    Watch the Magic Unfold
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </section>

                            {/* Create Recipe Section - Chapter 3: Premium Darker Blue/Cyan Theme */}
                            <section id="create" className="scroll-mt-24 relative overflow-hidden rounded-3xl p-8 self-start">
                                {/* Visual-only: Premium darker blue/cyan background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-cyan-200 to-sky-200 rounded-3xl"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-300/70 via-transparent to-cyan-300/60 rounded-3xl"></div>
                                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/40 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/40 rounded-full blur-3xl"></div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="relative z-10"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                                            <PlusCircle className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-blue-700">Chapter 3</span>
                                            <h2 className="text-3xl font-bold text-gray-900">Create Your Legacy</h2>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-8">
                                        Every great chef leaves their mark. Share your culinary wisdom and inspire others.
                                    </p>
                                    
                                    {!showRecipeForm ? (
                                        <motion.button
                                            onClick={() => setShowRecipeForm(true)}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-3 glow-blue"
                                        >
                                            <motion.div
                                                animate={{ rotate: [0, 90, 0] }}
                                                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                                            >
                                                <PlusCircle size={20} />
                                            </motion.div>
                                            Begin Your Masterpiece
                                        </motion.button>
                                    ) : (
                                        <motion.form
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onSubmit={handleSubmitRecipe}
                                            className="bg-gradient-to-br from-white to-blue-50/20 rounded-2xl shadow-xl p-6 border border-blue-100 backdrop-blur-sm"
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Recipe Title <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={recipeForm.data.title}
                                                        onChange={(e) => recipeForm.setData('title', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                                                        placeholder="Name your culinary creation"
                                                        required
                                                    />
                                                    {recipeForm.errors.title && (
                                                        <p className="mt-1 text-sm text-red-600">{recipeForm.errors.title}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Ingredients <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={recipeForm.data.ingredients}
                                                        onChange={(e) => recipeForm.setData('ingredients', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all min-h-[120px] resize-y"
                                                        placeholder={`Enter one ingredient per line
e.g.
2 cups flour
1 tsp salt
3 eggs`}
                                                        required
                                                    />
                                                    {recipeForm.errors.ingredients && (
                                                        <p className="mt-1 text-sm text-red-600">{recipeForm.errors.ingredients}</p>
                                                    )}
                                                    <p className="mt-1 text-xs text-gray-500">Enter one ingredient per line.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Cooking Steps <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={recipeForm.data.steps}
                                                        onChange={(e) => recipeForm.setData('steps', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all min-h-[120px] resize-y"
                                                        placeholder={`Enter one step per line
e.g.
Preheat oven to 375°F
Mix dry ingredients in a bowl
Add wet ingredients and stir`}
                                                        required
                                                    />
                                                    {recipeForm.errors.steps && (
                                                        <p className="mt-1 text-sm text-red-600">{recipeForm.errors.steps}</p>
                                                    )}
                                                    <p className="mt-1 text-xs text-gray-500">Enter one step per line.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Recipe Image (Optional)
                                                    </label>
                                                    <div className="space-y-2">
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    recipeForm.setData('thumbnail', file);
                                                                    // Create preview URL
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setImagePreview(reader.result);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                    // Clear thumbnail_url if file is selected
                                                                    if (recipeForm.data.thumbnail_url) {
                                                                        recipeForm.setData('thumbnail_url', '');
                                                                    }
                                                                } else {
                                                                    recipeForm.setData('thumbnail', null);
                                                                    setImagePreview(null);
                                                                }
                                                            }}
                                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-sm"
                                                        />
                                                        {imagePreview && (
                                                            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                                <img 
                                                                    src={imagePreview} 
                                                                    alt="Preview" 
                                                                    className="w-full h-48 object-cover rounded-lg mb-2"
                                                                />
                                                                {recipeForm.data.thumbnail instanceof File && (
                                                                    <>
                                                                        <p className="text-sm text-blue-700 font-medium mb-1">Selected: {recipeForm.data.thumbnail.name}</p>
                                                                        <p className="text-xs text-blue-600">{(recipeForm.data.thumbnail.size / 1024).toFixed(2)} KB</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                        {recipeForm.data.thumbnail instanceof File && !imagePreview && (
                                                            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                                <p className="text-sm text-blue-700 font-medium mb-1">Selected: {recipeForm.data.thumbnail.name}</p>
                                                                <p className="text-xs text-blue-600">{(recipeForm.data.thumbnail.size / 1024).toFixed(2)} KB</p>
                                                            </div>
                                                        )}
                                                        {recipeForm.errors.thumbnail && (
                                                            <p className="mt-1 text-sm text-red-600">{recipeForm.errors.thumbnail}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500">Or provide an image URL below</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Image URL (Optional)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={recipeForm.data.thumbnail_url}
                                                        onChange={(e) => {
                                                            recipeForm.setData('thumbnail_url', e.target.value);
                                                            // Clear thumbnail file and preview if URL is provided
                                                            if (e.target.value) {
                                                                if (recipeForm.data.thumbnail instanceof File) {
                                                                    recipeForm.setData('thumbnail', null);
                                                                }
                                                                setImagePreview(null);
                                                                if (fileInputRef.current) {
                                                                    fileInputRef.current.value = '';
                                                                }
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                                                        placeholder="https://example.com/image.jpg"
                                                    />
                                                    {recipeForm.errors.thumbnail_url && (
                                                        <p className="mt-1 text-sm text-red-600">{recipeForm.errors.thumbnail_url}</p>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <motion.button
                                                        type="submit"
                                                        disabled={recipeForm.processing}
                                                        whileHover={recipeForm.processing ? {} : { scale: 1.02, y: -2 }}
                                                        whileTap={recipeForm.processing ? {} : { scale: 0.98 }}
                                                        className="col-span-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed glow-blue"
                                                    >
                                                        {recipeForm.processing ? (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <motion.span
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                >
                                                                    ⚙️
                                                                </motion.span>
                                                                Crafting...
                                                            </span>
                                                        ) : 'Create Recipe'}
                                                    </motion.button>
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => {
                                                            recipeForm.reset();
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = '';
                                                            }
                                                            setImagePreview(null);
                                                            setShowRecipeForm(false);
                                                        }}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="col-span-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.form>
                                    )}
                                    
                                    {totalRecipes > 0 && (
                                        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                                            <p className="text-center text-blue-700 font-medium">
                                                You've created {totalRecipes} recipe{totalRecipes !== 1 ? 's' : ''}. Keep going!
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* My Recipes - Chapter 4: Premium Darker Green/Emerald Theme */}
                <section id="my-recipes" className="scroll-mt-24 relative overflow-hidden">
                    {/* Visual-only: Premium darker green/emerald background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-green-300/70 via-transparent to-emerald-300/60"></div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/40 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/40 rounded-full blur-3xl"></div>
                    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
                                    <BookOpen size={16} className="text-green-600" />
                                    <span className="text-sm font-medium text-green-700">Chapter 4</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                    Your Recipe Tome
                                </h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Every recipe you create becomes part of your culinary legacy.
                                </p>
                            </div>
                            
                            {userMeals && userMeals.length > 0 ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {userMeals.map((meal, index) => (
                                        <motion.div
                                            key={meal.meal_id}
                                            variants={cardVariants}
                                            whileHover="hover"
                                            className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-green-100"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3 bg-green-100 rounded-xl">
                                                        <BookOpen className="text-green-600" size={24} />
                                                    </div>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                        Your Creation
                                                    </span>
                                                </div>
                                                
                                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                                    {meal.title}
                                                </h3>
                                                
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Link
                                                        href={route('meal.details', meal.meal_id)}
                                                        className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors"
                                                    >
                                                        View Masterpiece
                                                        <motion.span
                                                            animate={{ rotate: [0, 10, -10, 0] }}
                                                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                                                        >
                                                            <Flame size={16} />
                                                        </motion.span>
                                                    </Link>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-block p-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl mb-6">
                                        <BookOpen className="text-green-400" size={64} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        Your Tome Awaits
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        Start writing your culinary story by creating your first recipe.
                                    </p>
                                    <motion.button
                                        onClick={() => setShowRecipeForm(true)}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow glow-green"
                                    >
                                        Begin Your First Chapter
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* My Favorites - Chapter 5: Premium Darker Rose/Pink Theme */}
                <section id="favorites" className="scroll-mt-24 relative overflow-hidden">
                    {/* Visual-only: Premium darker rose/pink background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-pink-200 to-fuchsia-200"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-300/70 via-transparent to-pink-300/60"></div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/40 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/40 rounded-full blur-3xl"></div>
                    {/* Visual-only: Subtle pattern */}
                    <div 
                        className="absolute inset-0 opacity-5 z-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ec4899' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px'
                        }}
                    ></div>
                    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full mb-4">
                                    <Heart size={16} className="text-rose-600" />
                                    <span className="text-sm font-medium text-rose-700">Chapter 5</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                    Your Treasure Chest
                                </h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    A curated collection of recipes that have captured your heart.
                                </p>
                            </div>
                            
                            {/* Search and Filter */}
                            <div className="max-w-2xl mx-auto mb-12">
                                <div className="bg-gradient-to-br from-white to-rose-50/20 rounded-2xl shadow-lg p-4 backdrop-blur-sm">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <form onSubmit={handleFavoriteSearchSubmit}>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                    <input
                                                        type="text"
                                                        value={favoriteSearchTerm}
                                                        onChange={(e) => handleFavoriteSearchChange(e.target.value)}
                                                        placeholder="Search your treasures..."
                                                        className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                                    />
                                                    {favoriteSearchTerm && (
                                                        <button
                                                            type="button"
                                                            onClick={handleClearFavoriteSearch}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Filter size={18} className="text-gray-500" />
                                            <select
                                                value={dateFilter}
                                                onChange={(e) => handleDateFilterChange(e.target.value)}
                                                className="px-4 py-2 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                            >
                                                <option value="">All Time</option>
                                                <option value="today">Today</option>
                                                <option value="week">This Week</option>
                                                <option value="month">This Month</option>
                                                <option value="year">This Year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Favorites Grid */}
                            {favorites && favorites.length > 0 ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {favorites.map((favorite, index) => (
                                        <motion.div
                                            key={favorite.meal_id}
                                            variants={cardVariants}
                                            whileHover="hover"
                                            className="group bg-gradient-to-br from-white to-rose-50/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-rose-100 relative backdrop-blur-sm"
                                        >
                                            <div className="absolute top-4 right-4">
                                                <button
                                                    onClick={() => handleRemoveFavorite(favorite.meal_id)}
                                                    className="p-2 bg-white/90 backdrop-blur-sm text-rose-500 rounded-full hover:bg-rose-50 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            
                                            <div className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <motion.div 
                                                        className="p-2 bg-rose-100 rounded-lg"
                                                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <Heart className="text-rose-600" size={20} />
                                                    </motion.div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 line-clamp-2">
                                                            {favorite.meal?.title || 'Unknown Recipe'}
                                                        </h3>
                                                        <span className="text-sm text-gray-500">
                                                            Added {new Date(favorite.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                        <Link
                                                            href={route('meal.details', favorite.meal_id)}
                                                            className="flex-1 text-center py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow block"
                                                        >
                                                            Revisit
                                                        </Link>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-block p-8 bg-gradient-to-r from-rose-100 to-pink-100 rounded-3xl mb-6">
                                        <Heart className="text-rose-400" size={64} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        Your Treasure Chest Awaits
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        Start collecting recipes that inspire you. Every favorite is a story waiting to be told.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* Final Chapter */}
                <section className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700">
                    <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                                <ChefHat className="text-white" size={48} />
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                                Your Journey Continues
                            </h2>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Every recipe discovered, created, and cherished adds another chapter to your culinary story. 
                                The kitchen is your canvas—keep creating masterpieces.
                            </p>
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-full shadow-lg">
                                <Sparkles size={20} />
                                <span>Bon Appétit!</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Progress Indicator */}
                <div className="fixed bottom-8 right-8 z-50">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-4 border-orange-200 border-t-orange-500 rounded-full"
                        />
                        <div className="relative w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center">
                            <ChefHat className="text-orange-500" size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}