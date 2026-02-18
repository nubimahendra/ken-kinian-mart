<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingZoneController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $zones = ShippingZone::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Shipping zones retrieved successfully.',
            'data' => $zones,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price_per_kg' => 'required|numeric|min:0',
        ]);

        $zone = ShippingZone::create($validated);

        // Clear cache
        \App\Services\Shipping\ShippingService::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Shipping zone created successfully.',
            'data' => $zone,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $zone = ShippingZone::find($id);

        if (!$zone) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping zone not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Shipping zone retrieved successfully.',
            'data' => $zone,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $zone = ShippingZone::find($id);

        if (!$zone) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping zone not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price_per_kg' => 'sometimes|numeric|min:0',
        ]);

        $zone->update($validated);

        // Clear cache
        \App\Services\Shipping\ShippingService::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Shipping zone updated successfully.',
            'data' => $zone,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $zone = ShippingZone::find($id);

        if (!$zone) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping zone not found.',
            ], 404);
        }

        $zone->delete();

        // Clear cache
        \App\Services\Shipping\ShippingService::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Shipping zone deleted successfully.',
        ]);
    }
}
