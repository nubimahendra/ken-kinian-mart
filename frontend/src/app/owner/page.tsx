'use client';

import { useEffect, useState } from 'react';
import { ownerFetch } from '@/lib/owner-api';
import { ApiResponse, PaginatedData, Order, Product } from '@/types';
import StatCard from '@/components/owner/StatCard';
import SalesChart from '@/components/owner/SalesChart';
import Link from 'next/link';

export default function OwnerOverview() {
    const [loading, setLoading] = useState(true);
    const [totalOrders, setTotalOrders] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [paidOrders, setPaidOrders] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    ownerFetch<ApiResponse<PaginatedData<Order>>>('/owner/orders?per_page=100'),
                    ownerFetch<ApiResponse<PaginatedData<Product>>>('/owner/products?per_page=100'),
                ]);

                const orders = ordersRes.data.data;

                setTotalOrders(ordersRes.data.total);
                setPendingOrders(orders.filter((o) => o.status === 'pending').length);
                setPaidOrders(orders.filter((o) => o.payment_status === 'paid').length);
                setTotalRevenue(orders.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + parseFloat(o.total_price), 0));
                setTotalProducts(productsRes.data.total);
                setRecentOrders(orders.slice(0, 8));

                // Build monthly chart data from orders
                const monthlyData: Record<string, number> = {};
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                months.forEach((m) => (monthlyData[m] = 0));
                orders
                    .filter((o) => o.payment_status === 'paid')
                    .forEach((o) => {
                        const d = new Date(o.created_at);
                        const monthKey = months[d.getMonth()];
                        monthlyData[monthKey] += parseFloat(o.total_price);
                    });
                setChartData(months.map((m) => ({ label: m, value: Math.round(monthlyData[m]) })));
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatPrice = (v: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const getStatusColor = (s: string) => {
        const c: Record<string, string> = { pending: 'bg-amber-50 text-amber-700', paid: 'bg-green-50 text-green-700', shipped: 'bg-blue-50 text-blue-700', completed: 'bg-primary-50 text-primary-700', cancelled: 'bg-red-50 text-red-700' };
        return c[s] || 'bg-gray-50 text-gray-700';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-72 bg-white rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Orders" value={totalOrders} color="from-blue-500 to-blue-600" icon={<span className="text-lg">📦</span>} />
                <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} color="from-emerald-500 to-emerald-600" icon={<span className="text-lg">💰</span>} />
                <StatCard label="Paid Orders" value={paidOrders} color="from-green-500 to-green-600" icon={<span className="text-lg">✅</span>} />
                <StatCard label="Pending Orders" value={pendingOrders} color="from-amber-500 to-amber-600" icon={<span className="text-lg">⏳</span>} />
                <StatCard label="Total Products" value={totalProducts} color="from-purple-500 to-purple-600" icon={<span className="text-lg">🏷️</span>} />
            </div>

            {/* Chart */}
            <SalesChart data={chartData} title="Monthly Revenue" />

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Recent Orders</h2>
                    <Link href="/owner/reports" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View Report →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Invoice</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Total</th>
                                <th className="text-center px-6 py-3 font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No orders yet</td></tr>
                            ) : recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-gray-900">{order.invoice_number}</td>
                                    <td className="px-6 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                                    <td className="px-6 py-3 text-right font-medium text-gray-900">{formatPrice(parseFloat(order.total_price))}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${getStatusColor(order.status)}`}>{order.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
