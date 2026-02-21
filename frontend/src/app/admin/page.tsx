'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { ApiResponse, PaginatedData, Order, Product } from '@/types';
import Link from 'next/link';

interface Stats {
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    totalProducts: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalOrders: 0, pendingOrders: 0, paidOrders: 0, totalProducts: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    adminFetch<ApiResponse<PaginatedData<Order>>>('/admin/orders?per_page=100'),
                    adminFetch<ApiResponse<PaginatedData<Product>>>('/admin/products?per_page=100'),
                ]);

                const orders = ordersRes.data.data;
                const products = productsRes.data;

                setStats({
                    totalOrders: ordersRes.data.total,
                    pendingOrders: orders.filter((o) => o.status === 'pending').length,
                    paidOrders: orders.filter((o) => o.payment_status === 'paid').length,
                    totalProducts: productsRes.data.total,
                });
                setRecentOrders(orders.slice(0, 10));
            } catch {
                // Handle silently
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const formatPrice = (price: string) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(price));

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-700',
            paid: 'bg-green-50 text-green-700',
            shipped: 'bg-blue-50 text-blue-700',
            completed: 'bg-primary-50 text-primary-700',
            cancelled: 'bg-red-50 text-red-700',
        };
        return colors[status] || 'bg-gray-50 text-gray-700';
    };

    const statCards = [
        { label: 'Total Orders', value: stats.totalOrders, color: 'from-blue-500 to-blue-600', icon: '📦' },
        { label: 'Pending Orders', value: stats.pendingOrders, color: 'from-amber-500 to-amber-600', icon: '⏳' },
        { label: 'Paid Orders', value: stats.paidOrders, color: 'from-primary-500 to-primary-700', icon: '✅' },
        { label: 'Total Products', value: stats.totalProducts, color: 'from-purple-500 to-purple-600', icon: '🏷️' },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-96 bg-white rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{card.icon}</span>
                            <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                                {card.value}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View all →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Invoice</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Total</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No orders yet</td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-900">{order.invoice_number}</td>
                                        <td className="px-6 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900">{formatPrice(order.total_price)}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
