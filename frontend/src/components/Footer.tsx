import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">
                                Kenkin<span className="text-primary-400">ian</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Fresh organic products delivered straight from local farms to your doorstep.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/products" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    Cart
                                </Link>
                            </li>
                            <li>
                                <Link href="/orders" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    My Orders
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/login" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
                        <ul className="space-y-2.5">
                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                hello@kenkinian.id
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                Surabaya, Indonesia
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 py-6 text-center">
                    <p className="text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} Kenkinian Mart. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
