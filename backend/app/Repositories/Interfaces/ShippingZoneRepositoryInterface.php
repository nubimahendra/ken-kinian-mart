<?php

namespace App\Repositories\Interfaces;

use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Collection;

interface ShippingZoneRepositoryInterface
{
    public function findById(int $id): ?ShippingZone;

    public function getAll(): Collection;
}
