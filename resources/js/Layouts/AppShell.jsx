import { Head, Link } from '@inertiajs/react';

export default function AppShell({ children, title }) {
    // Visual-only: Enhanced background for modern look
    return (
        <div className="min-h-screen bg-white">
            <Head title={title} />
            {children}
        </div>
    );
}

