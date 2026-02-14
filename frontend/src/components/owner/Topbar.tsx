'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
    '/owner': 'Overview',
    '/owner/reports': 'Reports',
    '/owner/admins': 'Admin Management',
    '/owner/shipping': 'Shipping Zones',
    '/owner/settings': 'Settings',
};

export default function OwnerTopbar() {
    const pathname = usePathname();

    const getTitle = () => {
        if (pageTitles[pathname]) return pageTitles[pathname];
        for (const [path, title] of Object.entries(pageTitles)) {
            if (pathname.startsWith(path) && path !== '/owner') return title;
        }
        return 'Owner Panel';
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-6">
            <div className="flex items-center justify-between w-full">
                <h1 className="text-lg font-bold text-gray-900">{getTitle()}</h1>
                <span className="text-xs text-gray-400">Owner Panel</span>
            </div>
        </header>
    );
}
