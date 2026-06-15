<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'status',
        'category_id'
    ];

    // Relationship
    public function category()
    {
        //Child(foreign key): use 'belongsTo'
        return $this->belongsTo(Category::class);
    }

    //Relationship
    public function productImage()
    {
        //Parent: use 'hasMany'
        return $this->hasMany(ProductImage::class);
    }

    //Relationship
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Methods
    public function hasSufficientStock($quantity)
    {
        return $this->stock >= $quantity;
    }

    public function decrementStock($quantity)
    {
        if (!$this->hasSufficientStock($quantity)) {
            return false;
        }
        $this->stock -= $quantity;
        return $this->save();
    }

    public function incrementStock($quantity)
    {
        $this->stock += $quantity;
        return $this->save();
    }
}
