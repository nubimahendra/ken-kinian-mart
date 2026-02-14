<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Services\CategoryService;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * List all categories.
     */
    public function index()
    {
        $categories = $this->categoryService->getAllCategories();

        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved successfully.',
            'data'    => $categories,
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = $this->categoryService->createCategory($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => $category,
        ], 201);
    }

    /**
     * Update an existing category.
     */
    public function update(UpdateCategoryRequest $request, int $id)
    {
        $category = $this->categoryService->getCategoryById($id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.',
                'data'    => null,
            ], 404);
        }

        $updated = $this->categoryService->updateCategory($category, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => $updated,
        ]);
    }

    /**
     * Delete a category.
     */
    public function destroy(int $id)
    {
        $category = $this->categoryService->getCategoryById($id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.',
                'data'    => null,
            ], 404);
        }

        $this->categoryService->deleteCategory($category);

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
            'data'    => null,
        ]);
    }
}
