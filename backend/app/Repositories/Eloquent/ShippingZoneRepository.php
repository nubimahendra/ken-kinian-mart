<?php

namespace App\Repositories\Eloquent;

use App\Models\ShippingZone;
use App\Repositories\Interfaces\ShippingZoneRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ShippingZoneRepository implements ShippingZoneRepositoryInterface
{
    public function findById(int $id): ?ShippingZone
    {
        return ShippingZone::find($id);
    }

    public function getAll(): Collection
    {
        return ShippingZone::all();
    }
}
