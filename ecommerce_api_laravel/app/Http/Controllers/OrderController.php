<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Process checkout: create order, decrement stock, clear cart
     */
    public function checkout(Request $request)
    {
        $user = Auth::user();
        
        // Validate request
        $request->validate([
            'payment_method' => 'required|in:card,paypal,apple_pay',
            'shipping_address' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            // Get cart items
            $cartItems = Cart::where('user_id', $user->id)
                ->with('product')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your cart is empty',
                ], 400);
            }

            // Validate stock availability
            foreach ($cartItems as $cartItem) {
                if (!$cartItem->product->hasSufficientStock($cartItem->quantity)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for product: {$cartItem->product->name}",
                    ], 400);
                }
            }

            // Calculate total
            $subtotal = $cartItems->sum(function ($item) {
                return $item->product->price * $item->quantity;
            });
            $tax = $subtotal * 0.10;
            $shipping = $subtotal >= 50 ? 0 : 5.99;
            $total = $subtotal + $tax + $shipping;

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'total_amount' => $total,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_status' => 'paid', // Simulating successful payment
                'shipping_address' => $request->shipping_address,
            ]);

            // Create order items and decrement stock
            foreach ($cartItems as $cartItem) {
                $subtotal = $cartItem->product->price * $cartItem->quantity;
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->product->price,
                    'subtotal' => $subtotal,
                ]);

                // Decrement product stock
                $cartItem->product->decrementStock($cartItem->quantity);
            }

            // Clear cart
            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's order history
     */
    public function index()
    {
        $user = Auth::user();
        
        $orders = Order::where('user_id', $user->id)
            ->with('orderItems.product')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                    'items_count' => $order->orderItems->count(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get specific order details
     */
    public function show($id)
    {
        $user = Auth::user();
        
        $order = Order::where('id', $id)
            ->where('user_id', $user->id)
            ->with('orderItems.product')
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        $orderData = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'total_amount' => $order->total_amount,
            'status' => $order->status,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'shipping_address' => $order->shipping_address,
            'created_at' => $order->created_at->format('Y-m-d H:i:s'),
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal,
                    'image' => $item->product->productImage->first()->image_url ?? null,
                ];
            }),
        ];

        return response()->json([
            'success' => true,
            'data' => $orderData,
        ]);
    }

    /**
     * Cancel order and restore stock
     */
    public function cancel($id)
    {
        $user = Auth::user();
        
        $order = Order::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        if ($order->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Order is already cancelled',
            ], 400);
        }

        if ($order->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel completed order',
            ], 400);
        }

        // Enforce 24-hour cancellation policy
        if ($order->created_at->diffInHours(now()) >= 24) {
            return response()->json([
                'success' => false,
                'message' => 'Orders can only be cancelled within 24 hours of purchase',
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Restore stock for each order item
            $orderItems = OrderItem::where('order_id', $order->id)->get();
            foreach ($orderItems as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->incrementStock($item->quantity);
                }
            }

            // Update order status
            $order->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order: ' . $e->getMessage(),
            ], 500);
        }
    }
}
