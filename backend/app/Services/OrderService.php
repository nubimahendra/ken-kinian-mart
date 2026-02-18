<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Services\Shipping\ShippingService;
use App\Services\Payment\PaymentService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class OrderService
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
        protected ShippingService $shippingService,
        protected PaymentService $paymentService
    ) {
    }

    /**
     * Process checkout and immediately generate Snap token.
     */
    public function checkoutWithPayment(array $items, int $shippingZoneId, int $userId): array
    {
        return DB::transaction(function () use ($items, $shippingZoneId, $userId) {
            // 1. Create Order
            $order = $this->checkout($items, $shippingZoneId, $userId);

            // 2. Generate Snap token
            // We need to load user relationship for the payment service
            $order->load(['user', 'items.product']);

            $snapToken = $this->paymentService->generateSnapToken($order);

            return [
                'order' => $order,
                'snap_token' => $snapToken
            ];
        });
    }

    /**
     * Process checkout: validate stock, calculate costs, create order atomically.
     *
     * @param  array  $items           Array of ['product_id' => int, 'quantity' => int]
     * @param  int    $shippingZoneId  Shipping zone ID
     * @param  int    $userId          Authenticated user ID
     * @return Order
     *
     * @throws InvalidArgumentException
     */
    public function checkout(array $items, int $shippingZoneId, int $userId): Order
    {
        return DB::transaction(function () use ($items, $shippingZoneId, $userId) {

            // 1. Fetch and validate products
            $productIds = array_column($items, 'product_id');
            $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

            $totalPrice = 0;
            $totalWeightGram = 0;
            $orderItems = [];

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);

                if (!$product) {
                    throw new InvalidArgumentException(
                        "Product with ID {$item['product_id']} not found."
                    );
                }

                if ($product->stock < $item['quantity']) {
                    throw new InvalidArgumentException(
                        "Insufficient stock for product '{$product->name}'. Available: {$product->stock}, requested: {$item['quantity']}."
                    );
                }

                $subtotal = $product->price * $item['quantity'];
                $totalPrice += $subtotal;
                $totalWeightGram += $product->weight * $item['quantity'];

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ];
            }

            // 2. Calculate shipping cost
            $shipping = $this->shippingService->calculateShippingCost($totalWeightGram, $shippingZoneId);

            // 3. Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber();

            // 4. Create order
            $order = $this->orderRepository->create([
                'user_id' => $userId,
                'invoice_number' => $invoiceNumber,
                'total_price' => $totalPrice + $shipping['cost'],
                'shipping_cost' => $shipping['cost'],
                'shipping_zone' => $shipping['zone_name'],
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            // 5. Create order items
            $order->items()->createMany($orderItems);

            // 6. Deduct stock
            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                $product->decrement('stock', $item['quantity']);
            }

            return $order->load('items.product');
        });
    }

    /**
     * Generate a unique invoice number: INV-YYYYMMDD-XXXX
     */
    public function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $invoice = "INV-{$date}-{$random}";

        // Ensure uniqueness
        while (Order::where('invoice_number', $invoice)->exists()) {
            $random = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $invoice = "INV-{$date}-{$random}";
        }

        return $invoice;
    }

    /**
     * Get paginated orders for a specific user.
     */
    public function getOrdersForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->orderRepository->getOrdersForUser($userId, $perPage);
    }

    /**
     * Get a single order detail for a specific user.
     */
    public function getOrderDetail(int $orderId, int $userId): ?Order
    {
        return $this->orderRepository->findByIdForUser($orderId, $userId);
    }

    /**
     * Get all orders (admin).
     */
    public function getAllOrders(int $perPage = 15): LengthAwarePaginator
    {
        return $this->orderRepository->getAllOrders($perPage);
    }

    /**
     * Update order status (admin).
     */
    public function updateOrderStatus(int $orderId, string $status): Order
    {
        $order = $this->orderRepository->findById($orderId);

        if (!$order) {
            throw new InvalidArgumentException('Order not found.');
        }

        return $this->orderRepository->updateStatus($order, $status);
    }
}
