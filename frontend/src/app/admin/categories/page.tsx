'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { adminFetch } from '@/lib/admin-api';
import { ApiResponse, Category } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/admin/Modal';

interface CategoryForm {
    name: string;
    slug: string;
    icon: string;
    imageFile: File | null;
    imagePreview: string | null;
}

const emptyForm: CategoryForm = { name: '', slug: '', icon: '', imageFile: null, imagePreview: null };

const EMOJIS = ["🍕", "🍔", "🥤", "🍰", "🍎", "🥦", "🥩", "🏠", "👕", "🎮", "💄", "💊", "📚", "🚗", "🏀", "🐶", "🎁", "💎", "✈️", "🔧", "🏷️", "📦", "🔥", "⭐"];

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<CategoryForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await adminFetch<ApiResponse<Category[]>>('/admin/categories');
            setCategories(res.data);
        } catch {
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleChange = (field: keyof CategoryForm, value: string) => {
        setForm((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'name' && !editId) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const handleEmojiSelect = (emoji: string) => {
        setForm(prev => ({ ...prev, icon: emoji }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, imageFile: file, imagePreview: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm);
        setError('');
        setModalOpen(true);
    };

    const openEdit = (cat: Category) => {
        setEditId(cat.id);
        setForm({
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon || '',
            imageFile: null,
            imagePreview: cat.image_url
        });
        setError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('slug', form.slug);
        if (form.icon) formData.append('icon', form.icon);
        if (form.imageFile) formData.append('image', form.imageFile);

        // Required for Laravel to handle PUT with FormData
        if (editId) formData.append('_method', 'PUT');

        try {
            const url = editId ? `/admin/categories/${editId}` : '/admin/categories';

            await adminFetch(url, {
                method: 'POST',
                body: formData,
            });

            setModalOpen(false);
            fetchCategories();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Failed to save category.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        setDeleting(id);
        try {
            await adminFetch(`/admin/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (err: unknown) {
            const e = err as { message?: string };
            alert(e.message || 'Failed to delete.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Manage product categories</p>
                <Button onClick={openCreate}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Category
                </Button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-400">No categories yet. Create one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gray-50 overflow-hidden shrink-0">
                                    {cat.image_url ? (
                                        <Image
                                            src={cat.image_url}
                                            alt={cat.name}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                            unoptimized
                                        />
                                    ) : (
                                        <span>{cat.icon || cat.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEdit(cat)}
                                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        disabled={deleting === cat.id}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">/{cat.slug}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Category' : 'Create Category'} maxWidth="sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
                    <Input label="Slug" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} required />

                    <div>
                        <Input label="Icon (emoji)" value={form.icon} onChange={(e) => handleChange('icon', e.target.value)} placeholder="🌿" />
                        <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Quick Select:</p>
                            <div className="flex flex-wrap gap-2">
                                {EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => handleEmojiSelect(emoji)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-lg"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                        <div className="flex items-center gap-4">
                            <div className="shrink-0 w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden relative">
                                {form.imagePreview ? (
                                    <Image src={form.imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                                ) : (
                                    <span className="text-2xl text-gray-300">
                                        {form.icon || '📷'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary-50 file:text-primary-700
                                        hover:file:bg-primary-100
                                        cursor-pointer"
                                />
                                <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP up to 2MB. Aspect ratio 1:1 recommended.</p>
                            </div>
                        </div>
                    </div>

                    {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={saving}>{editId ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
