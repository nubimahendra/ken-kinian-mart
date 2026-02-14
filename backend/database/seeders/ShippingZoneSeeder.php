<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = [
            ['name' => 'Jawa',               'price_per_kg' => 10000.00],
            ['name' => 'Sumatera',            'price_per_kg' => 18000.00],
            ['name' => 'Kalimantan',          'price_per_kg' => 22000.00],
            ['name' => 'Sulawesi',            'price_per_kg' => 25000.00],
            ['name' => 'Bali & Nusa Tenggara','price_per_kg' => 20000.00],
            ['name' => 'Papua & Maluku',      'price_per_kg' => 35000.00],
        ];

        foreach ($zones as $zone) {
            ShippingZone::updateOrCreate(
                ['name' => $zone['name']],
                $zone
            );
        }
    }
}
