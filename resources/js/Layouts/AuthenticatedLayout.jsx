import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import route from '@/route';

export default function AuthenticatedLayout({ auth, header, children }) {
    const { post, processing } = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title={header} />

            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href={route('dashboard')} className="text-xl font-bold text-gray-900">
                                    Recipe App
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-400 text-sm font-medium leading-5 text-gray-900 focus:outline-none focus:border-indigo-700 transition"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-700">
                                        {auth.user?.name}
                                    </span>
                                    <motion.button
                                        onClick={handleLogout}
                                        disabled={processing}
                                        whileHover={{ scale: processing ? 1 : 1.05 }}
                                        whileTap={{ scale: processing ? 1 : 0.95 }}
                                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-25"
                                    >
                                        Log Out
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {header}
                        </h2>
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}

