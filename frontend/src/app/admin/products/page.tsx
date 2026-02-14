'use client';

import { useEffect, useState, useRef } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { ApiResponse, PaginatedData, Product, Category } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/admin/Modal';
import Image from 'next/image';

interface ProductForm {
    category_id: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    cost_price: string;
    stock: string;
    weight: string;
    image_file: File | null;
}

const emptyForm: ProductForm = {
    category_id: '', name: '', slug: '', description: '',
    price: '', cost_price: '', stock: '', weight: '',
    image_file: null,
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = async (p: number) => {
        setLoading(true);
        try {
            const res = await adminFetch<ApiResponse<PaginatedData<Product>>>(`/admin/products?per_page=10&page=${p}`);
            setProducts(res.data.data);
            setLastPage(res.data.last_page);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await adminFetch<ApiResponse<Category[]>>('/admin/categories');
            setCategories(res.data);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        fetchProducts(page);
        fetchCategories();
    }, [page]);

    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleChange = (field: keyof ProductForm, value: string) => {
        setForm((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'name' && !editId) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setForm((prev) => ({ ...prev, image_file: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm);
        setImagePreview(null);
        setError('');
        setModalOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openEdit = (product: Product) => {
        setEditId(product.id);
        setForm({
            category_id: String(product.category_id),
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            price: product.price,
            cost_price: product.cost_price,
            stock: String(product.stock),
            weight: String(product.weight),
            image_file: null,
        });

        // Use image_url from backend if available, otherwise construct it or use raw image
        // Assuming backend sends 'image_url' (we added accessor)
        const initialPreview = (product as any).image_url || product.image;
        setImagePreview(initialPreview);

        setError('');
        setModalOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const formData = new FormData();
        formData.append('category_id', form.category_id);
        formData.append('name', form.name);
        formData.append('slug', form.slug);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('cost_price', form.cost_price);
        formData.append('stock', form.stock);
        formData.append('weight', form.weight);

        if (form.image_file) {
            formData.append('image', form.image_file);
        }

        // Must support method spoofing for Laravel PUT with files
        // Laravel cannot handle multipart/form-data with PUT/PATCH natively
        // So we POST with _method=PUT
        let url = '/admin/products';
        if (editId) {
            url = `/admin/products/${editId}`;
            formData.append('_method', 'PUT');
        }

        try {
            await adminFetch(url, {
                method: 'POST', // Always POST for FormData (with _method for updates)
                body: formData
            });

            setModalOpen(false);
            fetchProducts(page);
        } catch (err: unknown) {
            const e = err as { message?: string, data?: any };
            let msg = e.message || 'Failed to save product.';
            if (e.data && typeof e.data === 'object') {
                // Formatting validation errors
                const errors = Object.values(e.data).flat().join(', ');
                if (errors) msg = errors;
            }
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        setDeleting(id);
        try {
            await adminFetch(`/admin/products/${id}`, { method: 'DELETE' });
            fetchProducts(page);
        } catch (err: unknown) {
            const e = err as { message?: string };
            alert(e.message || 'Failed to delete.');
        } finally {
            setDeleting(null);
        }
    };

    const formatPrice = (price: string) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(price));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Manage your product inventory</p>
                </div>
                <Button onClick={openCreate}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Product
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Product</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-600">Category</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Price</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Stock</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No products found</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-50 rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative">
                                                    {(product as any).image_url || product.image ? (
                                                        <Image
                                                            src={(product as any).image_url || product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="40px"
                                                        />
                                                    ) : (
                                                        <span className="text-lg">📦</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-xs text-gray-400">{product.weight}g</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-md">
                                                {product.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium text-gray-900">{formatPrice(product.price)}</td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(product)}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deleting === product.id}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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

            {/* Create / Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Product' : 'Create Product'} maxWidth="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
                        <Input label="Slug" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                        <select
                            value={form.category_id}
                            onChange={(e) => handleChange('category_id', e.target.value)}
                            required
                            className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all"
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            required
                            className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Input label="Price" type="number" step="0.01" value={form.price} onChange={(e) => handleChange('price', e.target.value)} required />
                        <Input label="Cost Price" type="number" step="0.01" value={form.cost_price} onChange={(e) => handleChange('cost_price', e.target.value)} required />
                        <Input label="Stock" type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} required />
                        <Input label="Weight (g)" type="number" value={form.weight} onChange={(e) => handleChange('weight', e.target.value)} required />
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                        unoptimized={!!imagePreview.startsWith('blob:')}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png, image/jpeg, image/webp"
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary-50 file:text-primary-700
                                        hover:file:bg-primary-100
                                        cursor-pointer"
                                />
                                <p className="mt-1 text-xs text-gray-500">PNG, JPG or WebP (MAX. 2MB)</p>
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
