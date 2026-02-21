<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
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
        $search     = $request->string('search')->toString() ?: null;
        $sortBy     = $request->string('sort', 'newest')->toString();

        $products = $this->productService->getProducts($perPage, $categoryId, $search, $sortBy);

        return response()->json([
            'success' => true,
            'message' => 'Products retrieved successfully.',
            'data'    => $products,
        ]);
    }

    /**
     * Show a single product.
     */
    public function show(int $id)
    {
        $product = $this->productService->getProductById($id);

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

    /**
     * Store a new product.
     */
    public function store(StoreProductRequest $request)
    {
        $product = $this->productService->createProduct($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data'    => $product->load('category'),
        ], 201);
    }

    /**
     * Update an existing product.
     */
    public function update(UpdateProductRequest $request, int $id)
    {
        $product = $this->productService->getProductById($id);

        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
                'data'    => null,
            ], 404);
        }

        $updated = $this->productService->updateProduct($product, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data'    => $updated,
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy(int $id)
    {
        $product = $this->productService->getProductById($id);

        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
                'data'    => null,
            ], 404);
        }

        $this->productService->deleteProduct($product);

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
            'data'    => null,
        ]);
    }
}
