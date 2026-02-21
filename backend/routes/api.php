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

    // Password Reset Routes
    Route::post('/forgot-password', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'sendResetLinkEmail'])
        ->middleware('throttle:6,1'); // 6 requests per minute

    Route::post('/reset-password', [\App\Http\Controllers\Auth\ResetPasswordController::class, 'resetPassword'])
        ->middleware('throttle:6,1');

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
// Unified Admin Routes (auth + permissions)
// =============================================
Route::prefix('admin')->middleware(['auth:api'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Welcome to the Dashboard!',
            'data' => ['info' => 'Unified Admin & Owner dashboard.'],
        ]);
    });

    // Categories
    Route::apiResource('categories', AdminCategoryController::class)
        ->middleware('permission:manage_categories');

    // Products
    Route::apiResource('products', AdminProductController::class)
        ->middleware('permission:manage_products');

    // Orders
    Route::get('/orders', [AdminOrderController::class, 'index'])
        ->middleware('permission:manage_orders');
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus'])
        ->middleware('permission:manage_orders');

    // Financial / Reports
    Route::get('/report', [OwnerController::class, 'report'])
        ->middleware('permission:view_financial');

    // User Management
    Route::get('/admins', [OwnerController::class, 'listAdmins'])
        ->middleware('permission:manage_users');
    Route::post('/admins', [OwnerController::class, 'createAdmin'])
        ->middleware('permission:manage_users');
    Route::put('/admins/{id}', [OwnerController::class, 'updateAdmin'])
        ->middleware('permission:manage_users');

    // Shipping Zones
    Route::apiResource('shipping-zones', AdminShippingZoneController::class)
        ->middleware('permission:manage_orders');

    // Heroes
    Route::get('/heroes', [HeroController::class, 'indexAdmin'])
        ->middleware('permission:manage_products');
    Route::post('/heroes', [HeroController::class, 'store'])
        ->middleware('permission:manage_products');
    Route::put('/heroes/{hero}', [HeroController::class, 'update'])
        ->middleware('permission:manage_products');
    Route::delete('/heroes/{hero}', [HeroController::class, 'destroy'])
        ->middleware('permission:manage_products');
});

// =============================================
// Customer Routes (auth + role:customer)
// =============================================
Route::prefix('customer')->middleware(['auth:api', 'role:customer'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Welcome, Customer!',
            'data' => ['role' => 'customer', 'info' => 'This is the customer dashboard.'],
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
