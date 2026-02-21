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

    public function getProducts(int $perPage = 15, ?int $categoryId = null, ?string $search = null, string $sortBy = 'newest'): LengthAwarePaginator
    {
        return $this->productRepository->paginate($perPage, $categoryId, $search, $sortBy);
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

        return $updated;
    }

    public function deleteProduct(Product $product): bool
    {
        // Delete image
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $result = $this->productRepository->delete($product);

        return $result;
    }

}
