<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ShippingZoneController as AdminShippingZoneController;
use App\Http\Controllers\Customer\CategoryController as CustomerCategoryController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ProductController as CustomerProductController;
use App\Http\Controllers\Owner\OwnerController;
use App\Http\Controllers\PaymentCallbackController;
use App\Http\Controllers\Customer\ShippingZoneController;
use App\Http\Controllers\HeroController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =============================================
// Auth Routes (public — rate limited)
// =============================================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

    // Authenticated auth routes
    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// =============================================
// Public Routes (no auth)
// =============================================
Route::prefix('public')->group(function () {
    Route::get('/products', [CustomerProductController::class, 'index']);
    Route::get('/products/{slug}', [CustomerProductController::class, 'show']);
    Route::get('/categories', [CustomerCategoryController::class, 'index']);
    Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);
    Route::get('/heroes', [HeroController::class, 'index']);
});

// =============================================
// Owner Routes (auth + role:owner)
// =============================================
Route::prefix('owner')->middleware(['auth:api', 'role:owner'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Welcome, Owner!',
            'data' => ['role' => 'owner', 'info' => 'This is the owner dashboard.'],
        ]);
    });

    // Owner has full access to admin resources too
    // Categories
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

    // Products
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{id}', [AdminProductController::class, 'show']);
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);

    // Orders (full access)
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

    // Owner-only: Reports, Admin management, Shipping
    Route::get('/report', [OwnerController::class, 'report']);

    Route::get('/admins', [OwnerController::class, 'listAdmins']);
    Route::post('/admins', [OwnerController::class, 'createAdmin']);
    Route::put('/admins/{id}', [OwnerController::class, 'updateAdmin']);

    Route::get('/shipping-zones', [OwnerController::class, 'listShippingZones']);
    Route::put('/shipping-zones/{id}', [OwnerController::class, 'updateShippingZone']);

    // Heroes
    Route::get('/heroes', [HeroController::class, 'indexAdmin']);
    Route::post('/heroes', [HeroController::class, 'store']);
    Route::put('/heroes/{hero}', [HeroController::class, 'update']);
    Route::delete('/heroes/{hero}', [HeroController::class, 'destroy']);
});

// =============================================
// Admin Routes (auth + role:admin,owner)
// =============================================
Route::prefix('admin')->middleware(['auth:api', 'role:admin,owner'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Welcome, Admin!',
            'data' => ['role' => 'admin', 'info' => 'This is the admin dashboard.'],
        ]);
    });

    // Categories
    Route::apiResource('categories', AdminCategoryController::class);

    // Products
    Route::apiResource('products', AdminProductController::class);

    // Orders
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

    // Shipping Zones
    Route::apiResource('shipping-zones', AdminShippingZoneController::class);
});

// =============================================
// Customer Routes (auth + role:user)
// =============================================
Route::prefix('customer')->middleware(['auth:api', 'role:user'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Welcome, Customer!',
            'data' => ['role' => 'user', 'info' => 'This is the customer dashboard.'],
        ]);
    });

    // Orders
    Route::post('/checkout', [CustomerOrderController::class, 'checkout']);
    Route::get('/orders', [CustomerOrderController::class, 'index']);
    Route::get('/orders/{id}', [CustomerOrderController::class, 'show']);
    Route::post('/orders/{id}/pay', [CustomerOrderController::class, 'pay']);
});

// =============================================
// Payment Callback (public — rate limited, no auth)
// =============================================
Route::post('/payment/midtrans/callback', [PaymentCallbackController::class, 'handle'])
    ->middleware('throttle:callback');
