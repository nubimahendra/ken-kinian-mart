<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\Shipping\ShippingService;
use Illuminate\Http\JsonResponse;

class ShippingZoneController extends Controller
{
    public function __construct(
        protected ShippingService $shippingService
    ) {
    }

    /**
     * List all shipping zones.
     */
    public function index(): JsonResponse
    {
        $zones = $this->shippingService->getAllZones();

        return response()->json([
            'success' => true,
            'message' => 'Shipping zones retrieved successfully.',
            'data' => $zones,
        ]);
    }
}
