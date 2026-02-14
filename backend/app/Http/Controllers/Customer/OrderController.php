<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Services\OrderService;
use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService,
        protected PaymentService $paymentService
    ) {
    }

    /**
     * Process checkout — create an order from cart items.
     */
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->checkout(
                items: $request->validated()['items'],
                shippingZoneId: $request->validated()['shipping_zone_id'],
                userId: auth('api')->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'data' => $order,
            ], 201);

        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 422);
        }
    }

    /**
     * List authenticated user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 15);
        $orders = $this->orderService->getOrdersForUser(auth('api')->id(), $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Orders retrieved successfully.',
            'data' => $orders,
        ]);
    }

    /**
     * Show a single order detail for the authenticated user.
     */
    public function show(int $id): JsonResponse
    {
        $order = $this->orderService->getOrderDetail($id, auth('api')->id());

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order retrieved successfully.',
            'data' => $order,
        ]);
    }

    /**
     * Generate Midtrans Snap token to pay for an order.
     */
    public function pay(int $id): JsonResponse
    {
        $userId = auth('api')->id();

        // Find order belonging to authenticated user
        $order = $this->orderService->getOrderDetail($id, $userId);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
                'data' => null,
            ], 404);
        }

        try {
            // Load user relation for customer_details in Midtrans
            $order->load('user');

            $snapToken = $this->paymentService->generateSnapToken($order);

            return response()->json([
                'success' => true,
                'message' => 'Snap token generated successfully.',
                'data' => [
                    'snap_token' => $snapToken,
                    'order_id' => $order->id,
                    'invoice_number' => $order->invoice_number,
                ],
            ]);

        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payment token.',
                'data' => null,
            ], 500);
        }
    }
}

