import { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import route from '@/route';

export default function MealDetails({ auth, meal, flash, canEdit = false }) {
    const { post, processing } = useForm({ meal_id: meal?.meal_id });
    const { delete: destroy } = useForm();
    const [isEditing, setIsEditing] = useState(false);

    const updateForm = useForm({
        title: '',
        thumbnail: null,
        thumbnail_url: '',
        ingredients: '',
        steps: '',
    });

    useEffect(() => {
        if (meal && isEditing) {
            updateForm.setData({
                title: meal.title,
                thumbnail: null,
                thumbnail_url: meal.thumbnail || '',
                ingredients: meal.ingredients?.map(i => i.ingredient).join('\n'),
                steps: meal.steps?.map(s => s.step_description).join('\n'),
            });
        }
    }, [isEditing]);

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={meal.title} />

            <section className="bg-amber-50 min-h-screen py-16 px-6">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

                    <h1 className="text-5xl font-extrabold mb-2">
                        {meal.title}
                    </h1>
                    <p className="text-gray-500 mb-6">
                        A recipe worth remembering.
                    </p>

                    {meal.thumbnail && (
                        <img
                            src={meal.thumbnail}
                            alt={meal.title}
                            className="w-full h-64 object-cover rounded-lg mb-8"
                        />
                    )}

                    <h2 className="text-3xl font-bold mb-4">
                        What You’ll Need
                    </h2>
                    <ul className="list-disc list-inside mb-8">
                        {meal.ingredients.map((i, idx) => (
                            <li key={idx}>{i.ingredient}</li>
                        ))}
                    </ul>

                    <h2 className="text-3xl font-bold mb-4">
                        How It Comes Together
                    </h2>
                    <ol className="list-decimal list-inside space-y-2">
                        {meal.steps.map(step => (
                            <li key={step.step_number}>
                                {step.step_description}
                            </li>
                        ))}
                    </ol>

                    <div className="mt-10 flex justify-between">
                        <Link
                            href={route('dashboard')}
                            className="text-indigo-600 hover:underline"
                        >
                            ← Back to Dashboard
                        </Link>

                        <button
                            onClick={() => post(route('favorites.store'))}
                            disabled={processing}
                            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Save This Memory ❤️
                        </button>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
