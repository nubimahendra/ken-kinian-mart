'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { ApiResponse, PaginatedData, Order } from '@/types';
import Button from '@/components/Button';
import Link from 'next/link';

export default function OrdersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
            <OrdersContent />
        </Suspense>
    );
}

function OrdersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const newOrderId = searchParams.get('new');

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login?redirect=/orders');
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await apiFetch<ApiResponse<PaginatedData<Order>>>('/customer/orders?per_page=50');
                setOrders(res.data.data);
            } catch {
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [router]);

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'shipped':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'completed':
                return 'bg-primary-50 text-primary-700 border-primary-200';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    const handlePay = async (orderId: number) => {
        setPayingId(orderId);
        try {
            const res = await apiFetch<ApiResponse<{ snap_token: string }>>(`/customer/orders/${orderId}/pay`, {
                method: 'POST',
            });

            const snapToken = res.data.snap_token;

            // Use Midtrans Snap.js if available
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const win = window as unknown as Record<string, any>;
            if (win.snap) {
                win.snap.pay(snapToken, {
                    onSuccess: () => {
                        window.location.reload();
                    },
                    onPending: () => {
                        window.location.reload();
                    },
                    onClose: () => {
                        setPayingId(null);
                    },
                });
            } else {
                // Fallback: open Midtrans Snap URL
                const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
                const snapUrl = isProduction
                    ? `https://app.midtrans.com/snap/v2/vtweb/${snapToken}`
                    : `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
                window.open(snapUrl, '_blank');
                setPayingId(null);
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            alert(e.message || 'Failed to generate payment. Please try again.');
            setPayingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-48 mb-3" />
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-24" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Midtrans Snap.js Script */}
            <script
                src={`https://app.sandbox.midtrans.com/snap/snap.js`}
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
            />

            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your order history and status</p>
                </div>
            </div>

            {/* New order notification */}
            {newOrderId && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Order placed successfully! Click &quot;Pay Now&quot; to complete your payment.
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
                        <Link href="/products">
                            <Button>Browse Products</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${newOrderId && parseInt(newOrderId) === order.id
                                    ? 'border-green-300 ring-2 ring-green-100'
                                    : 'border-gray-100'
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm">{order.invoice_number}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${order.payment_status === 'paid'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {order.items.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                                                    <span className="truncate mr-4">
                                                        {item.product?.name || `Product #${item.product_id}`} × {item.quantity}
                                                    </span>
                                                    <span className="font-medium shrink-0">{formatPrice(item.price)}</span>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                        <div>
                                            <p className="text-xs text-gray-400">Total</p>
                                            <p className="text-lg font-bold text-primary-600">{formatPrice(order.total_price)}</p>
                                        </div>
                                        {order.status === 'pending' && order.payment_status === 'unpaid' && (
                                            <Button
                                                onClick={() => handlePay(order.id)}
                                                loading={payingId === order.id}
                                                size="sm"
                                            >
                                                Pay Now
                                            </Button>
                                        )}
                                        {order.paid_at && (
                                            <p className="text-xs text-gray-400">
                                                Paid on {formatDate(order.paid_at)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
