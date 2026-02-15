'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Product, CartItem } from '@/types';
import { addToCart } from '@/lib/cart';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [isWishlist, setIsWishlist] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock === 0) return;

        setIsAdding(true);

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));

        const item: CartItem = {
            product_id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: 1,
            weight: product.weight,
            image: product.image,
            slug: product.slug,
            stock: product.stock,
        };

        addToCart(item);
        window.dispatchEvent(new Event('cart-updated'));

        setIsAdding(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlist(!isWishlist);
    };

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(typeof price === 'string' ? parseFloat(price) : price);
    };

    const hasDiscount = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
    const discountPercentage = hasDiscount
        ? Math.round(((parseFloat(product.old_price!) - parseFloat(product.price)) / parseFloat(product.old_price!)) * 100)
        : 0;

    const rating = product.rating || 0;
    const reviewCount = product.review_count || 0;

    return (
        <div className="relative group h-full">
            {/* Success Toast */}
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Added to cart
            </div>

            <Link href={`/products/${product.slug}`} className="block h-full">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col relative">
                    {/* Image Section */}
                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}

                        {/* Hover Overlay Button */}
                        {product.stock > 0 && (
                            <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-xs font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    Lihat Detail
                                </span>
                            </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                            onClick={toggleWishlist}
                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 active:scale-95 transition-all duration-200 group-hover:opacity-100 opacity-0 md:opacity-100"
                        >
                            <svg
                                className={`w-5 h-5 transition-colors duration-200 ${isWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        </button>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.is_best_seller && (
                                <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                                    Best Seller
                                </span>
                            )}
                            {hasDiscount && (
                                <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm animate-pulse">
                                    {discountPercentage}% OFF
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-grow">
                        <div className="mb-1">
                            {product.category && (
                                <span className="text-xs text-gray-500 font-medium mb-1 block">
                                    {product.category.name}
                                </span>
                            )}
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
                                {product.name}
                            </h3>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mt-1.5">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'fill-current' : 'text-gray-200 fill-gray-200'}`}
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-400">({reviewCount})</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4">
                            {/* Price */}
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {formatPrice(product.price)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through decoration-gray-400">
                                        {formatPrice(product.old_price!)}
                                    </span>
                                )}
                            </div>

                            {/* Stock Indicator */}
                            {product.stock <= 5 && product.stock > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 flex-grow bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full w-[20%] animate-pulse"></div>
                                        </div>
                                        <span className="text-[10px] font-medium text-red-500 whitespace-nowrap">
                                            Stok Terbatas
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || isAdding}
                                className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all duration-300 relative overflow-hidden ${product.stock > 0
                                        ? 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white shadow-sm hover:shadow-lg active:scale-95'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isAdding ? (
                                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : product.stock > 0 ? (
                                    <>
                                        <span className="relative z-10 font-semibold group-hover/btn:translate-x-1 transition-transform">
                                            + Keranjang
                                        </span>
                                    </>
                                ) : (
                                    'Stok Habis'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
