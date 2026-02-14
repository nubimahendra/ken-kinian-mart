<?php

namespace App\Http\Controllers;

use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class PaymentCallbackController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {
    }

    /**
     * Handle Midtrans payment notification callback.
     *
     * This endpoint is called by Midtrans servers (server-to-server).
     * No authentication is required — security is handled via signature validation.
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            $payload = $request->all();

            // 1. Light validation (signature check) could be done here to prevent queue spam,
            // but for now we dispatch to queue to ensure fast response to Midtrans.
            // The job will handle full validation (signature, order existence, etc).

            \App\Jobs\ProcessPaymentNotification::dispatch($payload);

            return response()->json([
                'success' => true,
                'message' => 'Notification queued for processing.',
                'data' => null,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Internal server error.',
                'data' => null,
            ], 500);
        }
    }
}
