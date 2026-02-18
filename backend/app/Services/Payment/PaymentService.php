<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class PaymentService
{
    public function __construct()
    {
        // Configure Midtrans
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$clientKey = config('midtrans.client_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized = config('midtrans.is_sanitized');
        MidtransConfig::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Generate a Midtrans Snap token for the given order.
     *
     * @param  Order  $order  Must be loaded with 'items.product' and 'user' relations
     * @return string         Snap token
     *
     * @throws \Exception
     */
    public function generateSnapToken(Order $order): string
    {
        // Prevent payment for already-paid orders
        if ($order->payment_status === 'paid') {
            throw new InvalidArgumentException('Order has already been paid.');
        }

        // Prevent payment for non-pending orders
        if ($order->status !== 'pending') {
            throw new InvalidArgumentException('Order is not in a payable state.');
        }

        // Build item details array for Midtrans
        $itemDetails = [];

        foreach ($order->items as $item) {
            $itemDetails[] = [
                'id' => (string) $item->product_id,
                'price' => (int) $item->price,
                'quantity' => $item->quantity,
                'name' => substr($item->product->name ?? 'Product', 0, 50),
            ];
        }

        // Add shipping cost as an item
        if ($order->shipping_cost > 0) {
            $itemDetails[] = [
                'id' => 'SHIPPING',
                'price' => (int) $order->shipping_cost,
                'quantity' => 1,
                'name' => 'Shipping - ' . substr($order->shipping_zone, 0, 35),
            ];
        }

        // Transaction details
        $transactionDetails = [
            'order_id' => $order->invoice_number,
            'gross_amount' => (int) $order->total_price,
        ];

        // Customer details
        $customerDetails = [
            'first_name' => $order->user->name ?? 'Customer',
            'email' => $order->user->email ?? '',
        ];

        $params = [
            'transaction_details' => $transactionDetails,
            'item_details' => $itemDetails,
            'customer_details' => $customerDetails,
        ];

        // Get Snap token from Midtrans
        $snapToken = Snap::getSnapToken($params);

        // Save snap_token to order
        $order->update(['snap_token' => $snapToken]);

        return $snapToken;
    }

    /**
     * Handle Midtrans payment notification callback.
     *
     * @param  array  $payload  Raw notification payload from Midtrans
     * @return Order
     *
     * @throws InvalidArgumentException
     */
    public function handleNotification(array $payload): Order
    {
        // Log the entire callback payload
        Log::info('Midtrans Notification Received', $payload);

        // Validate required fields
        $requiredFields = ['order_id', 'status_code', 'gross_amount', 'signature_key', 'transaction_status'];
        foreach ($requiredFields as $field) {
            if (empty($payload[$field])) {
                throw new InvalidArgumentException("Missing required field: {$field}");
            }
        }

        // Validate signature key
        $serverKey = config('midtrans.server_key');
        $expectedSignature = hash(
            'SHA512',
            $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . $serverKey
        );

        if ($payload['signature_key'] !== $expectedSignature) {
            Log::warning('Midtrans Invalid Signature', [
                'order_id' => $payload['order_id'],
                'expected' => $expectedSignature,
                'received' => $payload['signature_key'],
            ]);
            throw new InvalidArgumentException('Invalid signature key.');
        }

        // Find order by invoice_number (order_id in Midtrans = invoice_number)
        $order = Order::where('invoice_number', $payload['order_id'])->first();

        if (!$order) {
            throw new InvalidArgumentException("Order not found for order_id: {$payload['order_id']}");
        }

        // Prevent double status update — if already paid, skip
        if ($order->payment_status === 'paid') {
            Log::info('Midtrans Notification: Order already paid, skipping.', [
                'order_id' => $payload['order_id'],
            ]);
            return $order;
        }

        // Process transaction status
        $transactionStatus = $payload['transaction_status'];
        $fraudStatus = $payload['fraud_status'] ?? 'accept';
        $paymentType = $payload['payment_type'] ?? null;
        $transactionId = $payload['transaction_id'] ?? null;

        // Save payment details if available
        if ($paymentType || $transactionId) {
            $order->update([
                'payment_type' => $paymentType,
                'transaction_id' => $transactionId,
            ]);
        }

        switch ($transactionStatus) {
            case 'capture':
                // For credit card: only accept if fraud status is 'accept'
                if ($fraudStatus === 'accept') {
                    $this->markAsPaid($order);
                }
                break;

            case 'settlement':
                $this->markAsPaid($order);
                break;

            case 'pending':
                // No action needed — order stays pending
                Log::info('Midtrans Notification: Payment pending.', [
                    'order_id' => $payload['order_id'],
                ]);
                break;

            case 'cancel':
            case 'expire':
            case 'deny':
                // Restore stock before cancelling
                if ($order->status !== 'cancelled') {
                    foreach ($order->items as $item) {
                        if ($item->product) {
                            $item->product->increment('stock', $item->quantity);
                        }
                    }
                }

                $order->update([
                    'status' => 'cancelled',
                    'payment_status' => 'unpaid',
                ]);

                Log::info("Midtrans Notification: Order {$transactionStatus}. Stock restored.", [
                    'order_id' => $payload['order_id'],
                ]);
                break;

            default:
                Log::warning('Midtrans Notification: Unhandled transaction status.', [
                    'order_id' => $payload['order_id'],
                    'transaction_status' => $transactionStatus,
                ]);
                break;
        }

        return $order->fresh();
    }

    /**
     * Mark an order as paid.
     */
    protected function markAsPaid(Order $order): void
    {
        $order->update([
            'status' => 'paid',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        Log::info('Midtrans Notification: Order paid successfully.', [
            'order_id' => $order->invoice_number,
            'paid_at' => $order->paid_at,
        ]);
    }
}
