'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ApiResponse, ShippingZone } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function ShippingPage() {
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);

    // Form state
    const [formData, setFormData] = useState({ name: '', price_per_kg: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const res = await apiFetch<ApiResponse<ShippingZone[]>>('/admin/shipping-zones');
            setZones(res.data);
        } catch {
            setError('Failed to fetch shipping zones.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (zone?: ShippingZone) => {
        if (zone) {
            setEditingZone(zone);
            setFormData({ name: zone.name, price_per_kg: zone.price_per_kg });
        } else {
            setEditingZone(null);
            setFormData({ name: '', price_per_kg: '' });
        }
        setError('');
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingZone(null);
        setFormData({ name: '', price_per_kg: '' });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const url = editingZone
                ? `/admin/shipping-zones/${editingZone.id}`
                : '/admin/shipping-zones';

            const method = editingZone ? 'PUT' : 'POST';

            // Ensure price is a number
            const payload = {
                name: formData.name,
                price_per_kg: parseFloat(formData.price_per_kg)
            };

            await apiFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            handleCloseModal();
            fetchZones();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Failed to save shipping zone.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this shipping zone?')) return;

        try {
            await apiFetch(`/admin/shipping-zones/${id}`, { method: 'DELETE' });
            fetchZones();
        } catch {
            alert('Failed to delete shipping zone.');
        }
    };

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(price));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shipping Zones</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage shipping rates per region</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    + Add Zone
                </Button>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-10 bg-gray-100 rounded"></div>
                        <div className="h-10 bg-gray-100 rounded"></div>
                        <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Zone Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Price per Kg</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {zones.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            No shipping zones found.
                                        </td>
                                    </tr>
                                ) : (
                                    zones.map((zone) => (
                                        <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{zone.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{formatPrice(zone.price_per_kg)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(zone)}
                                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(zone.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900">
                                {editingZone ? 'Edit Shipping Zone' : 'Add New Zone'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Zone Name"
                                placeholder="e.g. Jawa, Bali, Sumatera"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <Input
                                label="Price per Kg (IDR)"
                                type="number"
                                placeholder="e.g. 15000"
                                value={formData.price_per_kg}
                                onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                                min="0"
                                required
                            />

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    fullWidth
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    fullWidth
                                    loading={submitting}
                                >
                                    {editingZone ? 'Save Changes' : 'Create Zone'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
