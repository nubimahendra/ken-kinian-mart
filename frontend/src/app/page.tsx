'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ApiResponse, PaginatedData, Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/Button';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          apiFetch<ApiResponse<PaginatedData<Product>>>('/public/products?per_page=8', { skipAuth: true }),
          apiFetch<ApiResponse<Category[]>>('/public/categories', { skipAuth: true }).catch(() => ({ data: [] as Category[] })),
        ]);
        setProducts(prodRes.data?.data || []);
        setCategories((catRes as ApiResponse<Category[]>).data || []);
      } catch {
        // Silently continue — landing page still works without data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-green-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              Fresh from Local Farms
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Fresh Organic
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-green-500">
                Products
              </span>{' '}
              for You
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
              Premium quality organic fruits, vegetables, and essentials sourced directly from
              trusted local farmers. Delivered fresh to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Shop Now
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      {categories.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Shop by Category</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Browse our curated collection of organic products
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="group relative p-6 bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl border border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-3 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{cat.icon || '🌿'}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== BEST SELLERS ==================== */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Best Sellers</h2>
              <p className="text-gray-500">Our most popular products this week</p>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No products available yet.</p>
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link href="/products">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose Kenkinian?</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              We're committed to quality, freshness, and supporting local farmers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: '🌱',
                title: '100% Organic',
                desc: 'All our products are certified organic, free from harmful pesticides and chemicals.',
              },
              {
                icon: '🚚',
                title: 'Fast Delivery',
                desc: 'Same-day delivery available for select areas. Fresh products arrive at your doorstep quickly.',
              },
              {
                icon: '🤝',
                title: 'Support Local Farmers',
                desc: 'Every purchase directly supports local farming communities and sustainable agriculture.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-5 text-3xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-primary-600 to-green-600 rounded-3xl px-8 py-14 md:py-16 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Start Shopping Today
              </h2>
              <p className="text-primary-100 text-lg mb-8 max-w-md mx-auto">
                Join thousands of happy customers who trust us for fresh, organic products.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/products">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-primary-700 hover:bg-gray-50">
                    Browse Products
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
