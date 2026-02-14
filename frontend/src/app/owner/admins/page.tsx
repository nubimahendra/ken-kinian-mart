'use client';

import { useEffect, useState } from 'react';
import { ownerFetch } from '@/lib/owner-api';
import { ApiResponse, User } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/admin/Modal';

export default function OwnerAdminsPage() {
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await ownerFetch<ApiResponse<User[]>>('/owner/admins');
            setAdmins(res.data);
        } catch {
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await ownerFetch('/owner/admins', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            setModalOpen(false);
            setForm({ name: '', email: '', password: '' });
            fetchAdmins();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Failed to create admin.');
        } finally {
            setSaving(false);
        }
    };

    const handleDisable = async (id: number) => {
        if (!confirm('Disable this admin? Their role will be changed to "user".')) return;
        try {
            await ownerFetch(`/owner/admins/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ role: 'user' }),
            });
            fetchAdmins();
        } catch (err: unknown) {
            const e = err as { message?: string };
            alert(e.message || 'Failed to disable admin.');
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Manage admin accounts</p>
                <Button onClick={() => { setError(''); setModalOpen(true); }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Admin
                </Button>
            </div>

            {/* Admin List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Name</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Email</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Created</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : admins.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No admin users found</td></tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
                                                    {admin.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{admin.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">{admin.email}</td>
                                        <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(admin.created_at)}</td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => handleDisable(admin.id)}
                                                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                Disable
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Admin Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Admin" maxWidth="sm">
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

                    {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={saving}>Create Admin</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
