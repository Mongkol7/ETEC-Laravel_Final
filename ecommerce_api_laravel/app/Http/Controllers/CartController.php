<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get all cart items for authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        $cartItems = Cart::where('user_id', $user->id)
            ->with(['product.productImage'])
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'quantity' => $item->quantity,
                    'imageUrl' => $item->product->productImage->first()->image_url ?? null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $cartItems,
        ]);
    }

    /**
     * Add or update item in cart
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        
        // Check product stock
        $product = Product::find($request->product_id);
        if (!$product->hasSufficientStock($request->quantity)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available',
            ], 400);
        }
        
        $cartItem = Cart::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            // Check if new quantity exceeds stock
            $newQuantity = $cartItem->quantity + $request->quantity;
            if (!$product->hasSufficientStock($newQuantity)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock available for requested quantity',
                ], 400);
            }
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            $cartItem = Cart::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'data' => $cartItem,
        ]);
    }

    /**
     * Update quantity of item in cart
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $cartItem = Cart::where('user_id', $user->id)
            ->where('product_id', $id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        // Check if new quantity exceeds stock
        $product = Product::find($id);
        if (!$product->hasSufficientStock($request->quantity)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available for requested quantity',
            ], 400);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated',
            'data' => $cartItem,
        ]);
    }

    /**
     * Remove item from cart
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $cartItem = Cart::where('user_id', $user->id)
            ->where('product_id', $id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
        ]);
    }

    /**
     * Clear all items from cart
     */
    public function clear()
    {
        $user = Auth::user();
        Cart::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
        ]);
    }
}
