<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_id',
        'image_url',
        'public_id'
    ];

    //Relationship
    public function product()
    {
        //Child: use 'belongsTo'
        return $this->belongsTo(Product::class);
    }
}
