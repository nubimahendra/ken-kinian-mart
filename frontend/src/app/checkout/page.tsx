'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { getCart, getCartTotal, clearCart } from '@/lib/cart';
import { ApiResponse, CartItem, ShippingZone, Order } from '@/types';
import Button from '@/components/Button';
import Link from 'next/link';
import { snapPay, loadSnapScript } from '@/lib/midtrans';

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [selectedZone, setSelectedZone] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login?redirect=/checkout');
            return;
        }
        setCart(getCart());
        setMounted(true);

        // Preload Snap script
        loadSnapScript().catch(console.error);

        // Fetch shipping zones
        apiFetch<ApiResponse<ShippingZone[]>>('/public/shipping-zones', { skipAuth: true })
            .then((res) => {
                if (res.success) {
                    setZones(res.data);
                }
            })
            .catch(() => { });
    }, [router]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const { totalPrice, totalWeight, itemCount } = mounted ? getCartTotal() : { totalPrice: 0, totalWeight: 0, itemCount: 0 };

    const handleCheckout = async () => {
        if (!selectedZone) {
            setError('Please select a shipping zone.');
            return;
        }
        if (cart.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                items: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
                shipping_zone_id: selectedZone,
            };

            // Call checkout API — now returns order AND snap_token
            const res = await apiFetch<ApiResponse<{ order: Order; snap_token: string }>>('/customer/checkout', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            // Clear cart immediately on successful order creation
            clearCart();
            window.dispatchEvent(new Event('cart-updated'));

            const { order, snap_token } = res.data;

            // Open Midtrans Snap Popup
            await snapPay(snap_token, {
                onSuccess: (result) => {
                    console.log('Payment success', result);
                    router.push(`/orders?new=${order.id}&status=paid`);
                },
                onPending: (result) => {
                    console.log('Payment pending', result);
                    router.push(`/orders?new=${order.id}&status=pending`);
                },
                onError: (result) => {
                    console.error('Payment error', result);
                    router.push(`/orders?new=${order.id}&status=error`);
                },
                onClose: () => {
                    console.warn('Payment popup closed');
                    // Redirect to orders page with warning
                    router.push(`/orders?new=${order.id}&status=unpaid`);
                }
            });

        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Checkout failed. Please try again.');
            setLoading(false);
        }
    };

    if (!mounted) return null;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center px-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No items to checkout</h2>
                    <p className="text-gray-500 mb-6">Add some products to your cart first.</p>
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-sm text-gray-500 mt-1">Complete your order</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Order Items */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Order Items ({itemCount})</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {cart.map((item) => (
                            <div key={item.product_id} className="p-4 flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-green-50 rounded-xl overflow-hidden shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary-200">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Zone */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Shipping Zone</h2>
                    <div className="space-y-2">
                        <label htmlFor="shipping-zone" className="block text-sm text-gray-600">
                            Select your shipping zone
                        </label>
                        <select
                            id="shipping-zone"
                            value={selectedZone || ''}
                            onChange={(e) => setSelectedZone(e.target.value ? parseInt(e.target.value) : null)}
                            className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all appearance-none"
                        >
                            <option value="">-- Select Zone --</option>
                            {zones.map((zone) => (
                                <option key={zone.id} value={zone.id}>
                                    {zone.name} ({formatPrice(parseFloat(zone.price_per_kg))}/kg)
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400">
                            Shipping cost will be calculated based on total weight ({totalWeight}g) and zone.
                        </p>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
                    <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium">{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Total Weight</span>
                            <span className="font-medium">{totalWeight}g</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span className="text-gray-400 italic">Calculated by server</span>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="flex justify-between text-base font-bold text-gray-900">
                            <span>Estimated Total</span>
                            <span className="text-primary-600">{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleCheckout} loading={loading} fullWidth size="lg">
                        Same-Day Payment
                    </Button>
                    <Link href="/cart" className="w-full sm:w-auto">
                        <Button variant="outline" fullWidth size="lg">
                            Back to Cart
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
