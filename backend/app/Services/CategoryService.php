<?php

namespace App\Services;

use App\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryService
{
    protected $manager;

    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository
    ) {
        $this->manager = new ImageManager(new Driver());
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
        if (isset($data['image'])) {
            $data['image'] = $this->uploadImage($data['image']);
        }

        $category = $this->categoryRepository->create($data);
        Cache::forget('categories:all');
        return $category;
    }

    public function updateCategory(Category $category, array $data): Category
    {
        if (isset($data['image'])) {
            // Delete old image
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $this->uploadImage($data['image']);
        }

        $updated = $this->categoryRepository->update($category, $data);
        Cache::forget('categories:all');
        return $updated;
    }

    public function deleteCategory(Category $category): bool
    {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $result = $this->categoryRepository->delete($category);
        Cache::forget('categories:all');
        return $result;
    }

    protected function uploadImage($image): string
    {
        $filename = time() . '_' . Str::random(10) . '.webp';
        $path = 'categories/' . $filename;

        $img = $this->manager->read($image);
        $img->scaleDown(300, 300);
        
        // Encode to webp with 80% quality
        $encoded = $img->toWebp(80);

        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }
}
