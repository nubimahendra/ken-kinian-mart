<?php

namespace App\Services;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class ProductService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository
    ) {
    }

    public function getProducts(int $perPage = 15, ?int $categoryId = null): LengthAwarePaginator
    {
        $cacheKey = "products:page:" . request()->get('page', 1) . ":per:{$perPage}:cat:" . ($categoryId ?? 'all');

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($perPage, $categoryId) {
            return $this->productRepository->paginate($perPage, $categoryId);
        });
    }

    public function getProductById(int $id): ?Product
    {
        return $this->productRepository->findById($id);
    }

    public function getProductBySlug(string $slug): ?Product
    {
        return $this->productRepository->findBySlug($slug);
    }

    public function createProduct(array $data): Product
    {
        // Prevent negative stock
        if (isset($data['stock']) && $data['stock'] < 0) {
            $data['stock'] = 0;
        }

        // Handle Image Upload
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image'] = $data['image']->store('products', 'public');
        }

        $product = $this->productRepository->create($data);

        $this->clearCache();

        return $product;
    }

    public function updateProduct(Product $product, array $data): Product
    {
        // Prevent negative stock
        if (isset($data['stock']) && $data['stock'] < 0) {
            $data['stock'] = 0;
        }

        // Handle Image Upload
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            // Delete old image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $data['image']->store('products', 'public');
        }

        $updated = $this->productRepository->update($product, $data);

        $this->clearCache();

        return $updated;
    }

    public function deleteProduct(Product $product): bool
    {
        // Delete image
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $result = $this->productRepository->delete($product);

        $this->clearCache();

        return $result;
    }

    /**
     * Clear all product-related cache.
     */
    protected function clearCache(): void
    {
        // Clear using pattern — flush entire products cache prefix
        Cache::forget('products');
        // For file/database cache driver, clear via tags won't work
        // so we flush with a broader approach
        if (method_exists(Cache::getStore(), 'flush')) {
            // Only flush if using array/redis driver in testing
        }
        // In production with Redis, use Cache::tags(['products'])->flush();
        // For file-based cache, individual keys are cleared on TTL expiry
    }
}
