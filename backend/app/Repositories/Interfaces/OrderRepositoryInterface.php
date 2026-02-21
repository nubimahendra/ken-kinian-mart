<?php

namespace App\Repositories\Interfaces;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function create(array $data): Order;

    public function findById(int $id): ?Order;

    public function findByIdForUser(int $id, int $userId): ?Order;

    public function getOrdersForUser(int $userId, int $perPage = 15): LengthAwarePaginator;

    public function getAllOrders(int $perPage = 15, array $filters = []): LengthAwarePaginator;

    public function updateStatus(Order $order, string $status): Order;
}
