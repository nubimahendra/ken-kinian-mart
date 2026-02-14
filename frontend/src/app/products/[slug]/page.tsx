'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ApiResponse, Product, CartItem } from '@/types';
import { addToCart } from '@/lib/cart';
import Button from '@/components/Button';
import Link from 'next/link';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await apiFetch<ApiResponse<Product>>(`/public/products/${slug}`, {
                    skipAuth: true,
                });
                setProduct(res.data);
            } catch {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    const handleAddToCart = () => {
        if (!product || product.stock === 0) return;

        const item: CartItem = {
            product_id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity,
            weight: product.weight,
            image: product.image,
            slug: product.slug,
            stock: product.stock,
        };

        addToCart(item);
        window.dispatchEvent(new Event('cart-updated'));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
                        <div className="h-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
                <p className="text-gray-500 mb-6">The product you&apos;re looking for does not exist.</p>
                <Link href="/products">
                    <Button>Back to Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-primary-600 transition-colors">Products</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Image */}
                    <div className="aspect-square bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl overflow-hidden relative">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-32 h-32 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                        )}
                        {product.category && (
                            <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium text-primary-700 rounded-xl shadow-sm">
                                {product.category.name}
                            </span>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            {product.category && (
                                <span className="text-sm text-primary-600 font-medium">{product.category.name}</span>
                            )}
                        </div>

                        <div className="text-3xl font-bold text-primary-600">
                            {formatPrice(product.price)}
                        </div>

                        {product.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Product Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 mb-0.5">Stock</p>
                                <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-primary-600' : 'text-red-500'}`}>
                                    {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 mb-0.5">Weight</p>
                                <p className="text-sm font-semibold text-gray-900">{product.weight}g</p>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        {product.stock > 0 && (
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700">Qty:</span>
                                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            −
                                        </button>
                                        <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold border-x border-gray-200">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={handleAddToCart} fullWidth size="lg">
                                        {added ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                Added!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                Add to Cart
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {product.stock === 0 && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                                <p className="text-red-600 font-medium">This product is currently out of stock</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
