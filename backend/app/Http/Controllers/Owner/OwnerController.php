<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ShippingZone;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class OwnerController extends Controller
{
    // =========================================
    // Reports
    // =========================================

    /**
     * Sales report with date filter.
     */
    public function report(Request $request): JsonResponse
    {
        $start = $request->input('start');
        $end = $request->input('end');

        $query = Order::where('payment_status', 'paid');

        if ($start) {
            $query->whereDate('paid_at', '>=', $start);
        }
        if ($end) {
            $query->whereDate('paid_at', '<=', $end);
        }

        $orders = $query->with('items.product')->get();

        $totalRevenue = $orders->sum('total_price');
        $totalShipping = $orders->sum('shipping_cost');
        $totalItemsSold = 0;
        $estimatedProfit = 0;
        $productBreakdown = [];

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $totalItemsSold += $item->quantity;
                $costPrice = $item->product ? (float) $item->product->cost_price : 0;
                $estimatedProfit += ((float) $item->price * $item->quantity) - ($costPrice * $item->quantity);

                $pid = $item->product_id;
                if (!isset($productBreakdown[$pid])) {
                    $productBreakdown[$pid] = [
                        'product_id' => $pid,
                        'product_name' => $item->product->name ?? "Product #{$pid}",
                        'quantity_sold' => 0,
                        'revenue' => 0,
                        'profit' => 0,
                    ];
                }
                $productBreakdown[$pid]['quantity_sold'] += $item->quantity;
                $productBreakdown[$pid]['revenue'] += (float) $item->price * $item->quantity;
                $productBreakdown[$pid]['profit'] += ((float) $item->price * $item->quantity) - ($costPrice * $item->quantity);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Report generated successfully.',
            'data' => [
                'total_orders' => $orders->count(),
                'total_revenue' => round($totalRevenue, 2),
                'total_shipping' => round($totalShipping, 2),
                'estimated_profit' => round($estimatedProfit, 2),
                'total_items_sold' => $totalItemsSold,
                'products' => array_values($productBreakdown),
            ],
        ]);
    }

    // =========================================
    // Admin Management
    // =========================================

    /**
     * List admin users.
     */
    public function listAdmins(): JsonResponse
    {
        $admins = User::where('role', 'admin')
            ->select('id', 'name', 'email', 'role', 'created_at', 'updated_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Admin users retrieved successfully.',
            'data' => $admins,
        ]);
    }

    /**
     * Create a new admin user.
     */
    public function createAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin created successfully.',
            'data' => $admin->only('id', 'name', 'email', 'role', 'created_at'),
        ], 201);
    }

    /**
     * Update admin user (toggle active, reset password, etc.)
     */
    public function updateAdmin(Request $request, int $id): JsonResponse
    {
        $admin = User::where('role', 'admin')->find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin not found.',
                'data' => null,
            ], 404);
        }

        $data = [];
        if ($request->has('name')) {
            $data['name'] = $request->input('name');
        }
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->input('password'));
        }
        if ($request->has('role')) {
            // Allow changing role to 'user' to effectively disable admin
            $data['role'] = $request->input('role');
        }

        $admin->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Admin updated successfully.',
            'data' => $admin->only('id', 'name', 'email', 'role', 'created_at'),
        ]);
    }

    // =========================================
    // Shipping Zones
    // =========================================

    /**
     * List shipping zones.
     */
    public function listShippingZones(): JsonResponse
    {
        $zones = ShippingZone::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Shipping zones retrieved successfully.',
            'data' => $zones,
        ]);
    }

    /**
     * Update shipping zone.
     */
    public function updateShippingZone(Request $request, int $id): JsonResponse
    {
        $zone = ShippingZone::find($id);

        if (!$zone) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping zone not found.',
                'data' => null,
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'price_per_kg' => 'sometimes|numeric|min:0',
        ]);

        $zone->update($request->only(['name', 'price_per_kg']));

        // Clear cache so users get new prices immediately
        \App\Services\Shipping\ShippingService::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Shipping zone updated successfully.',
            'data' => $zone,
        ]);
    }
}
