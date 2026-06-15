<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\Models\Category;


class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //Get All Categories:
        return response()->json([
            'status' => true,
            'message' => 'Categories fetched successfully',
            'categories' => Category::all(),
            'total' => Category::count()
        ], 200);
    }
    //Test on Postman:
    //URL: GET: http://localhost:8000/api/admin/categories
    //Headers: Authorization: Bearer <token>

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //Create Category:
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories',
        ]);//slug: is a unique identifier for a category

        $category = Category::create($data);
        //Response:
        return response()->json([
            'status' => true,
            'message' => 'Category created successfully',
            'category' => $category
        ], 201);
    }
    //Test on Postman:
    //URL: POST: http://localhost:8000/api/admin/categories
    //Headers: Authorization: Bearer <token>

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //Find Category by ID:
        $category = Category::find($id);
        //Response:
        return response()->json([
            'status' => true,
            'message' => 'Get Category by ID successfully',
            'category' => $category::with('product')->get()
        ], 200);
    }
    //Test on Postman:
    //URL: GET: http://localhost:8000/api/admin/categories/{id}
    //Headers: Authorization: Bearer <token>
    //Body:json(raw): { "id": 1, "name": "Category Name", "description": "Category Description", "slug": "category-name" } 

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //Update Category:
        $category = Category::find($id);
        //Validation:
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $id,
            'description' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,' . $id,
        ]);
        $category->name = $data['name'];
        $category->description = $data['description'];
        $category->slug = $data['slug'];
        //Update in Database:
        $category->save();
        //Response:
        return response()->json([
            'status' => true,
            'message' => 'Category updated successfully',
            'category' => $category
        ], 200);
    }
    //Test on Postman:
    //URL: PUT: http://localhost:8000/api/admin/categories/{id}
    //Headers: Authorization: Bearer <token>
    //Body: json(raw): { "id": 1, "name": "Category Name", "description": "Category Description", "slug": "category-name" } 

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //Delete Category:
        $category = Category::find($id);
        //Check if category is exist:
        if (!$category) {
            return response()->json([
                'status' => false,
                'message' => 'Category not found'
            ], 404);
        }
        //Delete in Database:
        $category->delete();
        //Response:
        return response()->json([
            'status' => true,
            'message' => 'Category deleted successfully',
            'category' => $category
        ], 200);
    }
    //Test on Postman:
    //URL: DELETE: http://localhost:8000/api/admin/categories/{id}
    //Headers: Authorization: Bearer <token>
}
