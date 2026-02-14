'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/products': 'Products',
    '/admin/categories': 'Categories',
    '/admin/orders': 'Orders',
};

export default function AdminTopbar() {
    const pathname = usePathname();

    const getTitle = () => {
        // Exact match first
        if (pageTitles[pathname]) return pageTitles[pathname];
        // Prefix match
        for (const [path, title] of Object.entries(pageTitles)) {
            if (pathname.startsWith(path) && path !== '/admin') return title;
        }
        return 'Admin';
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-6">
            <div className="flex items-center justify-between w-full">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">{getTitle()}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">Admin Panel</span>
                </div>
            </div>
        </header>
    );
}
