import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppShell from '@/Layouts/AppShell';
import route from '@/route';

export default function Welcome({ meals, auth }) {
    return (
        <AppShell title="Welcome">
            <Head title="Welcome" />

            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                            <span className="block">Welcome to</span>
                            <span className="block text-indigo-600">Recipe App</span>
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Discover amazing recipes and save your favorites!
                        </p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
                        >
                            {auth?.user ? (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-md shadow"
                                >
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                                    >
                                        Go to Dashboard
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="rounded-md shadow space-x-4 flex">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            href={route('login')}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                                        >
                                            Log in
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            href={route('register')}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                                        >
                                            Register
                                        </Link>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {meals && meals.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mt-16"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Recipes</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {meals.map((meal, index) => (
                                    <motion.div
                                        key={meal.meal_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <Link
                                            href={route('meal.details', meal.meal_id)}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
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
                                            {meal.source && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Source: {meal.source}
                                                </p>
                                            )}
                                        </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}

