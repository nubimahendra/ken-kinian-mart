<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Makanan',    'slug' => 'makanan',    'icon' => '🍔'],
            ['name' => 'Minuman',    'slug' => 'minuman',    'icon' => '🥤'],
            ['name' => 'Snack',      'slug' => 'snack',      'icon' => '🍿'],
            ['name' => 'Frozen Food','slug' => 'frozen-food', 'icon' => '🧊'],
            ['name' => 'Bumbu Dapur','slug' => 'bumbu-dapur', 'icon' => '🌶️'],
        ];

        foreach ($categories as $data) {
            Category::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
