'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/products': 'Products',
    '/admin/categories': 'Categories',
    '/admin/orders': 'Orders',
};

export default function AdminTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 -ml-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">{getTitle()}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">Admin Panel</span>
                </div>
            </div>
        </header>
    );
}
