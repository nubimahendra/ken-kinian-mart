'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ApiResponse, PaginatedData, Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/Button';

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
            <ProductsContent />
        </Suspense>
    );
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCat, setSelectedCat] = useState<number | null>(
        categoryParam ? parseInt(categoryParam) : null
    );
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async (p: number, catId: number | null) => {
        setLoading(true);
        try {
            let endpoint = `/public/products?per_page=12&page=${p}`;
            if (catId) endpoint += `&category_id=${catId}`;

            const res = await apiFetch<ApiResponse<PaginatedData<Product>>>(endpoint, { skipAuth: true });
            setProducts(res.data.data);
            setLastPage(res.data.last_page);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        apiFetch<ApiResponse<Category[]>>('/public/categories', { skipAuth: true })
            .then((res) => setCategories(res.data || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        fetchProducts(page, selectedCat);
    }, [page, selectedCat]);

    const handleCategoryChange = (catId: number | null) => {
        setSelectedCat(catId);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Our Products</h1>
                    <p className="text-primary-100">Fresh organic products from local farms</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => handleCategoryChange(null)}
                            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all
                ${selectedCat === null
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                                }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all
                  ${selectedCat === cat.id
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                                    }`}
                            >
                                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="aspect-square bg-gray-200" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                        <p className="text-gray-400 text-lg">No products found.</p>
                    </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {[...Array(lastPage)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 text-sm font-medium rounded-xl transition-all
                    ${page === i + 1
                                            ? 'bg-primary-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(Math.min(lastPage, page + 1))}
                            disabled={page === lastPage}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
