<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository implements OrderRepositoryInterface
{
    public function create(array $data): Order
    {
        return Order::create($data);
    }

    public function findById(int $id): ?Order
    {
        return Order::with(['items.product', 'user'])->find($id);
    }

    public function findByIdForUser(int $id, int $userId): ?Order
    {
        return Order::with(['items.product'])
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }

    public function getOrdersForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::with(['items.product'])
            ->where('user_id', $userId)
            ->latest()
            ->paginate($perPage);
    }

    public function getAllOrders(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Order::with(['items.product', 'user'])->latest();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage);
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);

        return $order->fresh(['items.product', 'user']);
    }
}
