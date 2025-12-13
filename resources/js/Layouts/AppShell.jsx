import { Head, Link } from '@inertiajs/react';

export default function AppShell({ children, title }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />
            {children}
        </div>
    );
}

