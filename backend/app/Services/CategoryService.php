<?php

namespace App\Services;

use App\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class CategoryService
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository
    ) {
    }

    public function getAllCategories(): Collection
    {
        return Cache::remember('categories:all', now()->addMinutes(30), function () {
            return $this->categoryRepository->all();
        });
    }

    public function getCategoryById(int $id): ?Category
    {
        return $this->categoryRepository->findById($id);
    }

    public function createCategory(array $data): Category
    {
        $category = $this->categoryRepository->create($data);
        Cache::forget('categories:all');
        return $category;
    }

    public function updateCategory(Category $category, array $data): Category
    {
        $updated = $this->categoryRepository->update($category, $data);
        Cache::forget('categories:all');
        return $updated;
    }

    public function deleteCategory(Category $category): bool
    {
        $result = $this->categoryRepository->delete($category);
        Cache::forget('categories:all');
        return $result;
    }
}
