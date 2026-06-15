<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\FavouriteController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post("/auth/register", [AuthController::class, 'register']);
Route::post("/auth/login", [AuthController::class, 'login']);

// Public shopping routes:
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);

//Route for User:[prefix use to group routes together]
Route::prefix('user')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/profile', [AuthController::class,'getProfile']);
    Route::post('/logout', [AuthController::class,'logout']);
    //Category: user able to read only:
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    //Product: user able to read only:
    Route::apiResource('products', ProductController::class)->only(['index', 'show']);
    //Cart routes:
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/clear', [CartController::class, 'clear']);

    // Favourites routes:
    Route::get('/favourites', [FavouriteController::class, 'index']);
    Route::post('/favourites', [FavouriteController::class, 'store']);
    Route::delete('/favourites/{id}', [FavouriteController::class, 'destroy']);

    // Order routes:
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
});

//Route for Admin:
Route::prefix('admin')->middleware(['auth:sanctum', 'role'])->group(function () {
    //All methods of Resource Controller: index, store, show, update, destroy
    Route::apiResource('users', UserController::class);
    //Category: admin able to CRUD all:
    Route::apiResource('categories', CategoryController::class);
    //Product: admin able to CRUD all:
    Route::apiResource('products', ProductController::class);
});
