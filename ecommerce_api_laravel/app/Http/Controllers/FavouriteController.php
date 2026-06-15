<?php

namespace App\Http\Controllers;

use App\Models\Favourite;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavouriteController extends Controller
{
    /**
     * Get all favourite products for the authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        $favourites = Favourite::where('user_id', $user->id)
            ->with(['product.productImage', 'product.category'])
            ->get()
            ->map(function ($item) {
                return $item->product;
            })
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $favourites,
        ]);
    }

    /**
     * Toggle a product in favourites (add if not exists, remove if exists)
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = Auth::user();
        
        $favourite = Favourite::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($favourite) {
            $favourite->delete();
            return response()->json([
                'success' => true,
                'status' => 'removed',
                'message' => 'Item removed from favourites',
            ]);
        }

        $favourite = Favourite::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'added',
            'message' => 'Item added to favourites',
            'data' => $favourite,
        ]);
    }

    /**
     * Remove a product from favourites
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $favourite = Favourite::where('user_id', $user->id)
            ->where('product_id', $id)
            ->first();

        if (!$favourite) {
            return response()->json([
                'success' => false,
                'message' => 'Favourite item not found',
            ], 404);
        }

        $favourite->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from favourites',
        ]);
    }
}
