<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    public function paginate(int $perPage = 15, ?int $categoryId = null): LengthAwarePaginator
    {
        $query = Product::with('category');

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        return $query->latest()->paginate($perPage);
    }

    public function findById(int $id): ?Product
    {
        return Product::with('category')->find($id);
    }

    public function findBySlug(string $slug): ?Product
    {
        return Product::with('category')->where('slug', $slug)->first();
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh(['category']);
    }

    public function delete(Product $product): bool
    {
        return $product->delete();
    }
}
