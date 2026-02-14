<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $makanan    = Category::where('slug', 'makanan')->first();
        $minuman    = Category::where('slug', 'minuman')->first();
        $snack      = Category::where('slug', 'snack')->first();
        $frozen     = Category::where('slug', 'frozen-food')->first();
        $bumbu      = Category::where('slug', 'bumbu-dapur')->first();

        $products = [
            [
                'category_id' => $makanan->id,
                'name'        => 'Nasi Goreng Spesial',
                'slug'        => 'nasi-goreng-spesial',
                'description' => 'Nasi goreng dengan bumbu spesial dan telur mata sapi.',
                'price'       => 25000,
                'cost_price'  => 15000,
                'stock'       => 100,
                'weight'      => 350,
            ],
            [
                'category_id' => $makanan->id,
                'name'        => 'Mie Ayam Bakso',
                'slug'        => 'mie-ayam-bakso',
                'description' => 'Mie ayam dengan bakso sapi pilihan.',
                'price'       => 20000,
                'cost_price'  => 12000,
                'stock'       => 80,
                'weight'      => 300,
            ],
            [
                'category_id' => $minuman->id,
                'name'        => 'Es Teh Manis',
                'slug'        => 'es-teh-manis',
                'description' => 'Teh manis dingin segar.',
                'price'       => 5000,
                'cost_price'  => 2000,
                'stock'       => 200,
                'weight'      => 400,
            ],
            [
                'category_id' => $minuman->id,
                'name'        => 'Jus Alpukat',
                'slug'        => 'jus-alpukat',
                'description' => 'Jus alpukat segar dengan susu coklat.',
                'price'       => 15000,
                'cost_price'  => 8000,
                'stock'       => 50,
                'weight'      => 450,
            ],
            [
                'category_id' => $snack->id,
                'name'        => 'Keripik Singkong Pedas',
                'slug'        => 'keripik-singkong-pedas',
                'description' => 'Keripik singkong rasa pedas level 3.',
                'price'       => 12000,
                'cost_price'  => 7000,
                'stock'       => 150,
                'weight'      => 200,
            ],
            [
                'category_id' => $snack->id,
                'name'        => 'Makaroni Goreng',
                'slug'        => 'makaroni-goreng',
                'description' => 'Makaroni goreng renyah rasa original.',
                'price'       => 10000,
                'cost_price'  => 5000,
                'stock'       => 120,
                'weight'      => 150,
            ],
            [
                'category_id' => $frozen->id,
                'name'        => 'Nugget Ayam 500g',
                'slug'        => 'nugget-ayam-500g',
                'description' => 'Nugget ayam premium isi 20 pcs.',
                'price'       => 45000,
                'cost_price'  => 30000,
                'stock'       => 60,
                'weight'      => 500,
            ],
            [
                'category_id' => $frozen->id,
                'name'        => 'Sosis Sapi 1kg',
                'slug'        => 'sosis-sapi-1kg',
                'description' => 'Sosis sapi premium kemasan 1 kg.',
                'price'       => 55000,
                'cost_price'  => 38000,
                'stock'       => 40,
                'weight'      => 1000,
            ],
            [
                'category_id' => $bumbu->id,
                'name'        => 'Bumbu Rendang Instan',
                'slug'        => 'bumbu-rendang-instan',
                'description' => 'Bumbu rendang siap pakai untuk 1 kg daging.',
                'price'       => 8000,
                'cost_price'  => 4000,
                'stock'       => 200,
                'weight'      => 50,
            ],
            [
                'category_id' => $bumbu->id,
                'name'        => 'Sambal Terasi ABC',
                'slug'        => 'sambal-terasi-abc',
                'description' => 'Sambal terasi ABC kemasan botol 335ml.',
                'price'       => 14000,
                'cost_price'  => 9000,
                'stock'       => 180,
                'weight'      => 380,
            ],
        ];

        foreach ($products as $data) {
            Product::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
