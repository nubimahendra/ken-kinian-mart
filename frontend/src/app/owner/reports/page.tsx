'use client';

import { useState } from 'react';
import { ownerFetch } from '@/lib/owner-api';
import { ApiResponse } from '@/types';
import Button from '@/components/Button';

interface ReportData {
    total_orders: number;
    total_revenue: number;
    total_shipping: number;
    estimated_profit: number;
    total_items_sold: number;
    products: {
        product_id: number;
        product_name: string;
        quantity_sold: number;
        revenue: number;
        profit: number;
    }[];
}

export default function OwnerReportsPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            let endpoint = '/owner/report';
            const params: string[] = [];
            if (startDate) params.push(`start=${startDate}`);
            if (endDate) params.push(`end=${endDate}`);
            if (params.length) endpoint += `?${params.join('&')}`;

            const res = await ownerFetch<ApiResponse<ReportData>>(endpoint);
            setReport(res.data);
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Failed to generate report.');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (v: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Generate Report</h3>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                        />
                    </div>
                    <Button onClick={fetchReport} loading={loading}>Generate</Button>
                </div>
                {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            </div>

            {/* Summary Cards */}
            {report && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-xs text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{report.total_orders}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-xs text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatPrice(report.total_revenue)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-xs text-gray-500">Estimated Profit</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{formatPrice(report.estimated_profit)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-xs text-gray-500">Items Sold</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{report.total_items_sold}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-xs text-gray-500">Shipping Revenue</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{formatPrice(report.total_shipping)}</p>
                        </div>
                    </div>

                    {/* Product Breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Product Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left px-6 py-3 font-semibold text-gray-600">Product</th>
                                        <th className="text-right px-6 py-3 font-semibold text-gray-600">Qty Sold</th>
                                        <th className="text-right px-6 py-3 font-semibold text-gray-600">Revenue</th>
                                        <th className="text-right px-6 py-3 font-semibold text-gray-600">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {report.products.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No product data</td></tr>
                                    ) : (
                                        report.products
                                            .sort((a, b) => b.revenue - a.revenue)
                                            .map((p) => (
                                                <tr key={p.product_id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-3 font-medium text-gray-900">{p.product_name}</td>
                                                    <td className="px-6 py-3 text-right text-gray-700">{p.quantity_sold}</td>
                                                    <td className="px-6 py-3 text-right font-medium text-gray-900">{formatPrice(p.revenue)}</td>
                                                    <td className="px-6 py-3 text-right">
                                                        <span className={p.profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                            {formatPrice(p.profit)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
