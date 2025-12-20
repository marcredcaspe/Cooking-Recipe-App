import { Head, Link } from '@inertiajs/react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import AppShell from '@/Layouts/AppShell';
import route from '@/route';

export default function Welcome({ meals, auth }) {
    // Visual-only: Array of food images for random background selection (high-quality Unsplash images only)
    const foodImages = [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1920&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1920&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1920&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920&q=80&auto=format&fit=crop',
    ];

    // Visual-only: Random image selection on page load
    const [currentImageIndex, setCurrentImageIndex] = useState(() => 
        Math.floor(Math.random() * foodImages.length)
    );
    const [nextImageIndex, setNextImageIndex] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Visual-only: Crossfade transition between images
    useEffect(() => {
        const interval = setInterval(() => {
            const newIndex = Math.floor(Math.random() * foodImages.length);
            if (newIndex !== currentImageIndex) {
                setNextImageIndex(newIndex);
                setIsTransitioning(true);
                
                // After transition completes, update current image
                setTimeout(() => {
                    setCurrentImageIndex(newIndex);
                    setNextImageIndex(null);
                    setIsTransitioning(false);
                }, 2000); // Match transition duration
            }
        }, 8000); // Change image every 8 seconds

        return () => clearInterval(interval);
    }, [currentImageIndex]);

    // Visual-only: Scroll-based parallax effect for hero section
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    });
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <AppShell title="Welcome">
            <Head title="Welcome" />

            {/* Visual-only: Modern hero section with full-screen background images and parallax */}
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Visual-only: Full-screen background images with smooth crossfade */}
                <div className="absolute inset-0">
                    {/* Fallback gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>

                    {/* Current background image */}
                    <motion.div
                        key={`current-${currentImageIndex}`}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isTransitioning ? 0 : 1 }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="absolute inset-0"
                    >
                        <img
                            src={foodImages[currentImageIndex]}
                            alt="Food background"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: 'center' }}
                            onError={(e) => {
                                // Hide broken images - fallback gradient will show
                                e.target.style.display = 'none';
                            }}
                        />
                    </motion.div>

                    {/* Next background image (during transition) */}
                    <AnimatePresence>
                        {isTransitioning && nextImageIndex !== null && (
                            <motion.div
                                key={`next-${nextImageIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2, ease: 'easeInOut' }}
                                className="absolute inset-0"
                            >
                                <img
                                    src={foodImages[nextImageIndex]}
                                    alt="Food background"
                                    className="w-full h-full object-cover"
                                    style={{ objectPosition: 'center' }}
                                    onError={(e) => {
                                        // Hide broken images - fallback gradient will show
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Visual-only: Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/50 z-[1]"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-[1]"></div>
                </div>

                {/* Visual-only: Hero content with enhanced typography and spacing */}
                <motion.div
                    ref={heroRef}
                    style={{ y, opacity }}
                    className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
                    >
                        {/* Visual-only: Enhanced typography with gradient text */}
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6">
                            <span className="block text-white drop-shadow-2xl">Welcome to</span>
                            <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
                                Recipe App
                            </span>
                        </h1>
                        
                        {/* Visual-only: Refined description with better spacing */}
                        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed font-light drop-shadow-lg">
                            Discover amazing recipes and save your favorites!
                        </p>

                        {/* Visual-only: Enhanced CTA buttons with modern styling */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-10 max-w-md mx-auto sm:flex sm:justify-center gap-4"
                        >
                            {auth?.user ? (
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="rounded-full shadow-lg"
                                >
                                    <Link
                                        href={route('dashboard')}
                                        className="group relative w-full flex items-center justify-center px-10 py-4 border border-transparent text-base font-semibold rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl md:py-5 md:text-lg md:px-12"
                                    >
                                        <span className="relative z-10">Go to Dashboard</span>
                                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="rounded-full shadow-lg"
                                    >
                                        <Link
                                            href={route('login')}
                                            className="group relative w-full sm:w-auto flex items-center justify-center px-10 py-4 border border-transparent text-base font-semibold rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl md:py-5 md:text-lg md:px-12"
                                        >
                                            <span className="relative z-10">Log in</span>
                                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="rounded-full shadow-lg"
                                    >
                                        <Link
                                            href={route('register')}
                                            className="group relative w-full sm:w-auto flex items-center justify-center px-10 py-4 border-2 border-indigo-600 text-base font-semibold rounded-full text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl md:py-5 md:text-lg md:px-12"
                                        >
                                            Register
                                        </Link>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Visual-only: Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center backdrop-blur-sm bg-white/10"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1 h-3 bg-white/80 rounded-full mt-2"
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Visual-only: Featured recipes section with narrative-driven design */}
            {meals && meals.length > 0 && (
                <section className="relative py-24 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Visual-only: Section header with enhanced typography */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                                Featured Recipes
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">
                                Curated culinary experiences waiting to be discovered
                            </p>
                            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
                        </motion.div>

                        {/* Visual-only: Enhanced recipe grid with modern card design */}
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {meals.map((meal, index) => (
                                <motion.div
                                    key={meal.meal_id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="group"
                                >
                                    <Link
                                        href={route('meal.details', meal.meal_id)}
                                        className="block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
                                    >
                                        {/* Visual-only: Enhanced image container with overlay effect */}
                                        <div className="relative overflow-hidden bg-gray-200 aspect-[4/3]">
                                            {meal.thumbnail && (
                                                <>
                                                    <img
                                                        src={meal.thumbnail}
                                                        alt={meal.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    {/* Visual-only: Gradient overlay on hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                </>
                                            )}
                                            {/* Visual-only: Decorative corner accent */}
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-bl-full"></div>
                                        </div>
                                        
                                        {/* Visual-only: Enhanced card content with better spacing */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                                                {meal.title}
                                            </h3>
                                            {meal.source && (
                                                <p className="text-sm text-gray-500 font-medium flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                                                    {meal.source}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </AppShell>
    );
}

