import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppShell from '@/Layouts/AppShell';
import route from '@/route';

export default function Welcome({ meals, auth }) {
    return (
        <AppShell title="Welcome">
            <Head title="Welcome" />

            {/* HERO / STORY OPENING */}
            <section
                className="relative min-h-screen flex items-center justify-center text-white"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1600&q=80')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl px-6"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
                        Every Recipe Tells a Story
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 mb-10">
                        Discover flavors, create memories, and save the meals that matter.
                    </p>

                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-block px-10 py-4 bg-amber-400 text-black font-semibold rounded-full hover:bg-amber-300 transition"
                        >
                            Begin the Journey →
                        </Link>
                    ) : (
                        <div className="flex justify-center gap-4">
                            <Link
                                href={route('login')}
                                className="px-8 py-3 bg-indigo-600 rounded-full hover:bg-indigo-700"
                            >
                                Log In
                            </Link>
                            <Link
                                href={route('register')}
                                className="px-8 py-3 bg-white text-indigo-700 rounded-full hover:bg-gray-200"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </motion.div>
            </section>

            {/* FEATURED RECIPES */}
            {meals && meals.length > 0 && (
                <section className="bg-white py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            Featured Recipes
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {meals.map((meal) => (
                                <Link
                                    key={meal.meal_id}
                                    href={route('meal.details', meal.meal_id)}
                                    className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
                                >
                                    {meal.thumbnail && (
                                        <img
                                            src={meal.thumbnail}
                                            alt={meal.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg">
                                            {meal.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </AppShell>
    );
}
