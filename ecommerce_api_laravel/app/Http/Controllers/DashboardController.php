<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfCurrentMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // 1. Stats
        // Total Revenue (Paid orders, excluding cancelled)
        $totalRevenue = Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');
        
        $currentMonthRevenue = Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startOfCurrentMonth, $now])
            ->sum('total_amount');
            
        $lastMonthRevenue = Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total_amount');
            
        $revenueTrend = $this->calculateTrend($currentMonthRevenue, $lastMonthRevenue);

        // Active Orders (pending, processing)
        $activeOrdersCount = Order::whereIn('status', ['pending', 'processing'])->count();
        
        $currentMonthOrders = Order::whereBetween('created_at', [$startOfCurrentMonth, $now])->count();
        $lastMonthOrders = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $ordersTrend = $this->calculateTrend($currentMonthOrders, $lastMonthOrders);

        // New Signups
        $totalUsers = User::count();
        $currentMonthSignups = User::whereBetween('created_at', [$startOfCurrentMonth, $now])->count();
        $lastMonthSignups = User::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $signupsTrend = $this->calculateTrend($currentMonthSignups, $lastMonthSignups);

        // 2. Revenue Overview (Last 6 months)
        $revenueOverview = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthName = $month->format('M');
            $revenue = Order::where('payment_status', 'paid')
                ->where('status', '!=', 'cancelled')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total_amount');
            $orders = Order::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
                
            $revenueOverview[] = [
                'name' => $monthName,
                'revenue' => (float)$revenue,
                'orders' => $orders
            ];
        }

        // 3. Recent Users
        $recentUsers = User::orderBy('created_at', 'desc')
            ->take(4)
            ->get()
            ->map(function($user) {
                return [
                    'name' => $user->name,
                    'role' => $user->role == 'admin' ? 'Administrator' : 'Customer',
                    'image' => $user->image_url,
                    'time' => $user->created_at->diffForHumans(),
                    'color' => $this->getRandomColor($user->name)
                ];
            });

        // 4. Top Performing Products
        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sales'), DB::raw('SUM(subtotal) as total_revenue'))
            ->whereHas('order', function($query) {
                $query->where('payment_status', 'paid')
                      ->where('status', '!=', 'cancelled');
            })
            ->groupBy('product_id')
            ->orderBy('total_sales', 'desc')
            ->take(4)
            ->with('product')
            ->get()
            ->map(function($item) {
                $stockStatus = 'In Stock';
                if ($item->product->stock <= 0) $stockStatus = 'Out of Stock';
                elseif ($item->product->stock < 10) $stockStatus = 'Low Stock';
                
                return [
                    'id' => 'PRD-' . str_pad($item->product->id, 2, '0', STR_PAD_LEFT),
                    'name' => $item->product->name,
                    'sales' => (int)$item->total_sales,
                    'revenue' => '$' . number_format($item->total_revenue, 2),
                    'stock' => $stockStatus
                ];
            });

        return response()->json([
            'status' => true,
            'data' => [
                'stats' => [
                    'total_revenue' => [
                        'value' => (float)$totalRevenue,
                        'trend' => $revenueTrend['value'],
                        'trend_type' => $revenueTrend['type']
                    ],
                    'active_orders' => [
                        'value' => $activeOrdersCount,
                        'trend' => $ordersTrend['value'],
                        'trend_type' => $ordersTrend['type']
                    ],
                    'total_users' => [
                        'value' => $totalUsers,
                        'trend' => $signupsTrend['value'],
                        'trend_type' => $signupsTrend['type']
                    ]
                ],
                'revenue_overview' => $revenueOverview,
                'recent_users' => $recentUsers,
                'top_products' => $topProducts
            ]
        ]);
    }

    private function calculateTrend($current, $last)
    {
        if ($last == 0) {
            return ['value' => $current > 0 ? 100 : 0, 'type' => 'up'];
        }
        
        $diff = $current - $last;
        $percent = ($diff / $last) * 100;
        
        return [
            'value' => round(abs($percent), 1),
            'type' => $percent >= 0 ? 'up' : 'down'
        ];
    }

    private function getRandomColor($name)
    {
        $colors = ['#00ff8c', '#00c9ff', '#a200ff', '#ff9100', '#ff4757'];
        $index = ord(substr($name, 0, 1)) % count($colors);
        return $colors[$index];
    }
}
