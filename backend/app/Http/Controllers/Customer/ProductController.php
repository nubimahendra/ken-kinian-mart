<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * List products with pagination and optional category filter.
     */
    public function index(Request $request)
    {
        $perPage    = $request->integer('per_page', 15);
        $categoryId = $request->integer('category_id') ?: null;

        $products = $this->productService->getProducts($perPage, $categoryId);

        return response()->json([
            'success' => true,
            'message' => 'Products retrieved successfully.',
            'data'    => $products,
        ]);
    }

    /**
     * Show a single product by slug.
     */
    public function show(string $slug)
    {
        $product = $this->productService->getProductBySlug($slug);

        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product retrieved successfully.',
            'data'    => $product,
        ]);
    }
}
