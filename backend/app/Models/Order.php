<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'invoice_number',
        'total_price',
        'shipping_cost',
        'shipping_zone',
        'status',
        'payment_status',
        'snap_token',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns this order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for this order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
