'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import OwnerSidebar from '@/components/owner/Sidebar';
import OwnerTopbar from '@/components/owner/Topbar';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace('/login?redirect=/owner');
            return;
        }

        const user = getStoredUser();
        if (user && user.role === 'owner') {
            setAuthorized(true);
        } else {
            router.replace('/');
        }
        setChecking(false);
    }, [router]);

    if (checking || !authorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <OwnerSidebar isOpen={isSidebarOpen} />
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <OwnerTopbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
