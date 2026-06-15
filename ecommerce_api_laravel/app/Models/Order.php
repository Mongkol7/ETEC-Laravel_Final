<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'status',
        'payment_method',
        'payment_status',
        'shipping_address',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'shipping_address' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Methods
    public static function generateOrderNumber()
    {
        $prefix = 'ORD';
        $timestamp = now()->format('Ymd');
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
        return $prefix . $timestamp . $random;
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
