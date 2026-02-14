<?php

namespace App\Services\Shipping;

use App\Repositories\Interfaces\ShippingZoneRepositoryInterface;
use InvalidArgumentException;
use Illuminate\Support\Facades\Cache;

class ShippingService
{
    public function __construct(
        protected ShippingZoneRepositoryInterface $zoneRepository
    ) {
    }

    /**
     * Calculate shipping cost based on total weight and zone.
     *
     * @param  int  $totalWeightGram  Total weight in grams
     * @param  int  $zoneId           Shipping zone ID
     * @return array  ['cost' => int, 'zone_name' => string]
     *
     * @throws InvalidArgumentException
     */
    public function calculateShippingCost(int $totalWeightGram, int $zoneId): array
    {
        $zone = $this->zoneRepository->findById($zoneId);

        if (!$zone) {
            throw new InvalidArgumentException('Shipping zone not found.');
        }

        // Convert grams to kilograms (round up)
        $weightKg = ceil($totalWeightGram / 1000);

        $cost = $weightKg * $zone->price_per_kg;

        return [
            'cost' => (int) $cost,
            'zone_name' => $zone->name,
        ];
    }

    /**
     * Get all shipping zones (cached for 60 minutes).
     */
    public function getAllZones(): mixed
    {
        return Cache::remember('shipping_zones:all', now()->addMinutes(60), function () {
            return $this->zoneRepository->getAll();
        });
    }

    /**
     * Clear shipping zone cache.
     */
    public static function clearCache(): void
    {
        Cache::forget('shipping_zones:all');
    }
}
