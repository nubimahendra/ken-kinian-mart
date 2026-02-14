'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { ApiResponse, PaginatedData, Order } from '@/types';
import Button from '@/components/Button';
import Modal from '@/components/admin/Modal';

type StatusFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('all');

    // Detail modal
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchOrders = async (p: number) => {
        setLoading(true);
        try {
            const res = await adminFetch<ApiResponse<PaginatedData<Order>>>(`/admin/orders?per_page=15&page=${p}`);
            setOrders(res.data.data);
            setLastPage(res.data.last_page);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(page); }, [page]);

    const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    const formatPrice = (price: string) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(price));

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            paid: 'bg-green-50 text-green-700 border-green-200',
            shipped: 'bg-blue-50 text-blue-700 border-blue-200',
            completed: 'bg-primary-50 text-primary-700 border-primary-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        setUpdatingStatus(true);
        try {
            await adminFetch(`/admin/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            // Refresh
            fetchOrders(page);
            if (detailOrder && detailOrder.id === orderId) {
                setDetailOrder({ ...detailOrder, status: newStatus as Order['status'] });
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            alert(e.message || 'Failed to update status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const statusFilters: { label: string; value: StatusFilter }[] = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
    ];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {statusFilters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all
              ${filter === f.value
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Invoice</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Zone</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Total</th>
                                <th className="text-center px-6 py-3 font-semibold text-gray-600">Status</th>
                                <th className="text-center px-6 py-3 font-semibold text-gray-600">Payment</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(7)].map((__, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No orders found</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-900">{order.invoice_number}</td>
                                        <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                                        <td className="px-6 py-3 text-gray-500">{order.shipping_zone}</td>
                                        <td className="px-6 py-3 text-right font-medium text-gray-900">{formatPrice(order.total_price)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-lg border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setDetailOrder(order)}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="View detail"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                {/* Quick status buttons */}
                                                {order.status === 'paid' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                                        disabled={updatingStatus}
                                                        className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        Ship
                                                    </button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                                                        disabled={updatingStatus}
                                                        className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Page {page} of {lastPage}</p>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors">Prev</button>
                            <button onClick={() => setPage(Math.min(lastPage, page + 1))} disabled={page === lastPage} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Order ${detailOrder?.invoice_number || ''}`} maxWidth="lg">
                {detailOrder && (
                    <div className="space-y-5">
                        {/* Status & Payment */}
                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${getStatusColor(detailOrder.status)}`}>
                                Status: {detailOrder.status}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${detailOrder.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>
                                Payment: {detailOrder.payment_status}
                            </span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-400">Total Price</p>
                                <p className="font-semibold text-gray-900">{formatPrice(detailOrder.total_price)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-400">Shipping Cost</p>
                                <p className="font-semibold text-gray-900">{formatPrice(detailOrder.shipping_cost)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-400">Shipping Zone</p>
                                <p className="font-semibold text-gray-900">{detailOrder.shipping_zone}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-400">Created</p>
                                <p className="font-semibold text-gray-900">{formatDate(detailOrder.created_at)}</p>
                            </div>
                        </div>

                        {/* Items */}
                        {detailOrder.items && detailOrder.items.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                                <div className="space-y-2">
                                    {detailOrder.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">{item.product?.name || `Product #${item.product_id}`} × {item.quantity}</span>
                                            <span className="font-medium text-gray-900">{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Update */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                                {['shipped', 'completed', 'cancelled'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={status === 'cancelled' ? 'danger' : status === 'completed' ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(detailOrder.id, status)}
                                        loading={updatingStatus}
                                        disabled={detailOrder.status === status}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
