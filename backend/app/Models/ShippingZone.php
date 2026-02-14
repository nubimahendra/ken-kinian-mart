<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price_per_kg',
    ];

    protected function casts(): array
    {
        return [
            'price_per_kg' => 'decimal:2',
        ];
    }
}
