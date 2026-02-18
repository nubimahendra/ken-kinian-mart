'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCartTotal, clearCart } from '@/lib/cart';
import { isAuthenticated, removeToken, getStoredUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [cartCount, setCartCount] = useState(0);
    const [authed, setAuthed] = useState(false);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setAuthed(isAuthenticated());
        const user = getStoredUser();
        if (user) {
            setUserName(user.name);
            setUserRole(user.role);
        }

        const updateCart = () => {
            const { itemCount } = getCartTotal();
            setCartCount(itemCount);
        };
        updateCart();

        window.addEventListener('cart-updated', updateCart);
        window.addEventListener('storage', updateCart);
        return () => {
            window.removeEventListener('cart-updated', updateCart);
            window.removeEventListener('storage', updateCart);
        };
    }, []);

    const handleLogout = () => {
        removeToken();
        clearCart();
        window.dispatchEvent(new Event('cart-updated'));
        setAuthed(false);
        setUserName('');
        setUserRole('');
        setMenuOpen(false);
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Kenkin<span className="text-primary-600">ian</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {!['admin', 'owner'].includes(userRole) && (
                            <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all">
                                Home
                            </Link>
                        )}
                        {!['admin', 'owner'].includes(userRole) && (
                            <Link href="/products" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all">
                                Products
                            </Link>
                        )}
                        {authed && !['admin', 'owner'].includes(userRole) && (
                            <Link href="/orders" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all">
                                My Orders
                            </Link>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Cart */}
                        {!['admin', 'owner'].includes(userRole) && (
                            <Link
                                href="/cart"
                                className="relative p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Auth */}
                        <div className="hidden md:flex items-center gap-2">
                            {authed ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                                        {userName}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm hover:shadow-md transition-all"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        >
                            {menuOpen ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-in slide-in-from-top-2">
                        {!['admin', 'owner'].includes(userRole) && (
                            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                                Home
                            </Link>
                        )}
                        {!['admin', 'owner'].includes(userRole) && (
                            <Link href="/products" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                                Products
                            </Link>
                        )}
                        {authed && !['admin', 'owner'].includes(userRole) && (
                            <Link href="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                                My Orders
                            </Link>
                        )}
                        <div className="border-t border-gray-100 pt-2 mt-2">
                            {authed ? (
                                <>
                                    <span className="block px-4 py-2 text-sm font-medium text-gray-700">{userName}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                                        Login
                                    </Link>
                                    <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
