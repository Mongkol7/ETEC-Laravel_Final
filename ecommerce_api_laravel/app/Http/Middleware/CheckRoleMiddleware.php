<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        //1. Check login
        if ($request->user() && $request->user()->role != 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized - Insufficient permissions'
            ], 403);
        }
        return $next($request); 
    }
    //Test on Postman:
    //URL: GET: http://localhost:8000/api/admin/test
    //Headers: Authorization: Bearer <token>
}
