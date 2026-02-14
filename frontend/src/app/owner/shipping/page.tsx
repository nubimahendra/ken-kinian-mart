'use client';

import { useEffect, useState } from 'react';
import { ownerFetch } from '@/lib/owner-api';
import { ApiResponse, ShippingZone } from '@/types';
import Button from '@/components/Button';

export default function OwnerShippingPage() {
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editPrice, setEditPrice] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchZones = async () => {
        setLoading(true);
        try {
            const res = await ownerFetch<ApiResponse<ShippingZone[]>>('/owner/shipping-zones');
            setZones(res.data);
        } catch {
            setZones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchZones(); }, []);

    const startEdit = (zone: ShippingZone) => {
        setEditingId(zone.id);
        setEditPrice(zone.price_per_kg);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditPrice('');
    };

    const savePrice = async (id: number) => {
        setSaving(true);
        try {
            await ownerFetch(`/owner/shipping-zones/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ price_per_kg: parseFloat(editPrice) }),
            });
            setEditingId(null);
            fetchZones();
        } catch (err: unknown) {
            const e = err as { message?: string };
            alert(e.message || 'Failed to update.');
        } finally {
            setSaving(false);
        }
    };

    const formatPrice = (v: string) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(v));

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-500">Configure shipping zones and pricing</p>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Zone Name</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Price per Kg</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : zones.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">No shipping zones</td></tr>
                            ) : (
                                zones.map((zone) => (
                                    <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <span className="text-sm">🚚</span>
                                                </div>
                                                <span className="font-medium text-gray-900">{zone.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {editingId === zone.id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editPrice}
                                                    onChange={(e) => setEditPrice(e.target.value)}
                                                    className="w-32 px-3 py-1.5 text-sm text-right bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-medium text-gray-900">{formatPrice(zone.price_per_kg)}/kg</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {editingId === zone.id ? (
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={cancelEdit} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                                    <Button size="sm" onClick={() => savePrice(zone.id)} loading={saving}>Save</Button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEdit(zone)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>
                                            )}
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
