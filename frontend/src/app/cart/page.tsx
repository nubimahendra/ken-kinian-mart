'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CartItem } from '@/types';
import { getCart, updateQuantity, removeFromCart, getCartTotal } from '@/lib/cart';
import { isAuthenticated } from '@/lib/auth';
import Button from '@/components/Button';

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setCart(getCart());
        setMounted(true);
    }, []);

    const handleUpdateQty = (productId: number, qty: number) => {
        const updated = updateQuantity(productId, qty);
        setCart(updated);
        window.dispatchEvent(new Event('cart-updated'));
    };

    const handleRemove = (productId: number) => {
        const updated = removeFromCart(productId);
        setCart(updated);
        window.dispatchEvent(new Event('cart-updated'));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (!mounted) return null;

    const { totalPrice, totalWeight, itemCount } = getCartTotal();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Discover fresh products and add them to your cart</p>
                    <Link href="/products">
                        <Button>Browse Products</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-sm text-gray-500 mt-1">{itemCount} items in your cart</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.product_id}
                                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex gap-4 shadow-sm"
                            >
                                {/* Image */}
                                <Link href={`/products/${item.slug}`} className="shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl overflow-hidden">
                                        {item.image_url || item.image ? (
                                            <img src={item.image_url || item.image || ""} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <Link href={`/products/${item.slug}`} className="hover:text-primary-600 transition-colors">
                                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(item.product_id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.weight}g per unit</p>
                                    <div className="flex items-end justify-between mt-3">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => handleUpdateQty(item.product_id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm transition-colors"
                                            >
                                                −
                                            </button>
                                            <span className="w-10 h-8 flex items-center justify-center text-xs font-semibold border-x border-gray-200">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleUpdateQty(item.product_id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm transition-colors disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-sm font-bold text-primary-600">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Weight</span>
                                    <span className="font-medium">{totalWeight}g</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-gray-400 italic">Calculated at checkout</span>
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex justify-between text-base font-bold text-gray-900">
                                    <span>Estimated Total</span>
                                    <span className="text-primary-600">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                            {isAuthenticated() ? (
                                <Link href="/checkout" className="block mt-6">
                                    <Button fullWidth size="lg">
                                        Proceed to Checkout
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login?redirect=/checkout" className="block mt-6">
                                    <Button fullWidth size="lg" variant="outline">
                                        Login to Checkout
                                    </Button>
                                </Link>
                            )}
                            <Link href="/products" className="block mt-3 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
