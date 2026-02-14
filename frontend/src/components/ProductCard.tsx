'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product, CartItem } from '@/types';
import { addToCart } from '@/lib/cart';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
    };

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    return (
        <Link href={`/products/${product.slug}`} className="group">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="aspect-square bg-gradient-to-br from-primary-50 to-green-50 relative overflow-hidden">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                    )}
                    {/* Category badge */}
                    {product.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-primary-700 rounded-lg shadow-sm">
                            {product.category.name}
                        </span>
                    )}
                    {/* Stock badge */}
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-white text-xs font-medium rounded-lg shadow-sm">
                            {product.stock} left
                        </span>
                    )}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="px-4 py-2 bg-white text-gray-800 text-sm font-semibold rounded-xl">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors mb-1.5">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                        {product.weight}g
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                            {formatPrice(product.price)}
                        </span>
                        {product.stock > 0 && (
                            <button
                                onClick={handleAddToCart}
                                className="p-2.5 bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Add to cart"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
