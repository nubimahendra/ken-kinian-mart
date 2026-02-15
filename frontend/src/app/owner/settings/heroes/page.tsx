'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Hero, ApiResponse } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function HeroesPage() {
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingHero, setEditingHero] = useState<Hero | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        is_active: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchHeroes();
    }, []);

    const fetchHeroes = async () => {
        try {
            const res = await apiFetch<ApiResponse<Hero[]>>('/owner/heroes');
            setHeroes(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingHero(null);
        setFormData({
            title: '',
            subtitle: '',
            cta_text: '',
            cta_link: '',
            is_active: true,
        });
        setImageFile(null);
    };

    const handleEdit = (hero: Hero) => {
        setEditingHero(hero);
        setFormData({
            title: hero.title || '',
            subtitle: hero.subtitle || '',
            cta_text: hero.cta_text || '',
            cta_link: hero.cta_link || '',
            is_active: hero.is_active,
        });
        setImageFile(null);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('subtitle', formData.subtitle);
        data.append('cta_text', formData.cta_text);
        data.append('cta_link', formData.cta_link);

        // Explicitly send "1" or "0"
        data.append('is_active', formData.is_active ? '1' : '0');

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingHero) {
                // Update (use _method=PUT for FormData in Laravel)
                data.append('_method', 'PUT');
                await apiFetch(`/owner/heroes/${editingHero.id}`, {
                    method: 'POST',
                    body: data,
                });
            } else {
                await apiFetch('/owner/heroes', {
                    method: 'POST',
                    body: data,
                });
            }
            resetForm();
            fetchHeroes();
        } catch (error) {
            console.error(error);
            alert('Failed to save hero slide. Please make sure the image is valid and under 2MB.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;
        try {
            await apiFetch(`/owner/heroes/${id}`, { method: 'DELETE' });
            fetchHeroes();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
                    <p className="text-sm text-gray-500">Manage the homepage hero section content.</p>
                </div>
                {editingHero && (
                    <Button variant="outline" onClick={resetForm}>Cancel Edit</Button>
                )}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">{editingHero ? 'Edit Slide' : 'Add New Slide'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Fresh Organic Products"
                        />
                        <Input
                            label="Subtitle"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="e.g. Premium quality sourced locally"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="CTA Text"
                            value={formData.cta_text}
                            onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                            placeholder="e.g. Shop Now"
                        />
                        <Input
                            label="CTA Link"
                            value={formData.cta_link}
                            onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                            placeholder="e.g. /products"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image {editingHero && '(Leave empty to keep current)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            required={!editingHero}
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x600px, Max 2MB.</p>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Active</label>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" loading={saving}>
                            {editingHero ? 'Update Slide' : 'Create Slide'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* List Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Existing Slides</h3>
                </div>
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : heroes.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No slides created yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {heroes.map((hero) => (
                                    <tr key={hero.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '')}/storage/${hero.image}`}
                                                alt="Hero"
                                                className="h-16 w-24 object-cover rounded-lg border border-gray-200"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{hero.title || '(No Title)'}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{hero.subtitle}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${hero.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {hero.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(hero)} className="text-primary-600 hover:text-primary-900 mr-4 font-medium">Edit</button>
                                            <button onClick={() => handleDelete(hero.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
