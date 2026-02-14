<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\CategoryService;
use Illuminate\Http\Request;

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
}
