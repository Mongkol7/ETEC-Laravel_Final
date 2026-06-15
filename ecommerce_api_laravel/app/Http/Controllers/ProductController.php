<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Select * from product join productImage
        $product = Product::with(['productImage', 'category'])->get();

        // Get all Products:
        return response()->json([
            'status' => true,
            'message' => 'Products fetched successfully',
            'total' => Product::count(),
            'products' => $product,
        ], 200);
    }
    // Test on Postman:
    // URL: GET: http://localhost:8000/api/admin/products
    // Headers: Authorization: Bearer <token>

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Create Product:
        $rules = [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products',
            'description' => 'nullable',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
        ];
        // Check if user uploads images or image:
        $imageField = $request->hasFile('images') ? 'images' : 'image';
        // Validate Image:
        if (is_array($request->file($imageField))) {
            $rules[$imageField] = 'nullable|array';
            $rules[$imageField.'.*'] = 'image|mimes:jpeg,png,jpg,gif,svg|max:2048';
        } else {
            $rules[$imageField] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048';
        }
        //
        $data = $request->validate($rules); // Status: already set Default as 'Active' in Migration of Products
        // Remove image and images from data: for avoiding Mass Assignment Error
        unset($data['image'], $data['images']);

        // Create Product:
        $product = Product::create($data);

        // Check if user uploads images or image:
        if ($request->hasFile($imageField)) {
            $images = $request->file($imageField);
            $images = is_array($images) ? $images : [$images];

            // Looping all images to Upload to Cloudinary:
            foreach ($images as $image) {
                // Upload to Cloudinary:
                $upload = Cloudinary::upload($image->getRealPath(), [
                    'folder' => 'ecommerce_laravel_api/images/products',

                ]);
                // Store into Database:
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $upload->getSecurePath(),
                    'public_id' => $upload->getPublicId(),
                ]);
            }
        }
        // Get Product by ID: for showing list of image
        $saveProduct = $product->load('productImage');

        // Response:
        return response()->json([
            'status' => true,
            'message' => 'Product created successfully',
            'product' => $saveProduct,
        ], 201);
    }
    // Test on Postman:
    // URL: POST: http://localhost:8000/api/admin/products
    // Headers: Authorization: Bearer <token>
    // Body:form-data
    // category_id: number
    // name: string
    // slug: string (slug is same as name but without space and special characters )
    // description: string
    // price: number
    // stock: number
    // image: file (if user wants to upload only one image)
    // images[]: files (if user wants to upload multiple images)

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Show Detail of Product:

        // Select * from product join productImage where product.id = :id
        $product = Product::with(['productImage', 'category'])->find($id);
        // Response:
        if ($product) {
            return response()->json([
                'status' => true,
                'message' => 'Product details fetched successfully',
                'product' => $product,
            ], 200);
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Product not found',
            ], 404);
        }
        // Test on Postman:
        // URL: GET: http://localhost:8000/api/admin/products/{id}
        // Headers: Authorization: Bearer <token>
        // Body: { "id": 1 }

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Update Products:
        //Get Product by ID join with productImage:
        $product = Product::with('productImage')->find($id);
        //Check if product is found:
        if (! $product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found',
            ], 404);
        }

        //validate Rules:
        $rules = [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug,'.$product->id,
            'description' => 'nullable',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
        ];

        // Check if user uploads images or image:
        $imageField = $request->hasFile('images') ? 'images' : 'image';
        // Validate Image:
        if (is_array($request->file($imageField))) {
            $rules[$imageField] = 'nullable|array';
            $rules[$imageField.'.*'] = 'image|mimes:jpeg,png,jpg,gif,svg|max:2048';
        } else {
            $rules[$imageField] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048';
        }

        // Validate Data:
        $validated = $request->validate($rules);
        // Remove image and images from data: for avoiding Mass Assignment Error
        unset($validated['image'], $validated['images']);

        // Update Product in Database:
        $product->update($validated);

        // Update Product Images:
        if ($request->hasFile($imageField)) {
            // Get Images from Cloudinary to Delete First:
            $productImages = ProductImage::where('product_id', $id)->get();
            foreach ($productImages as $productImage) {
                Cloudinary::destroy($productImage->public_id);
                $productImage->delete();
            }
            // Get New Images:
            $images = $request->file($imageField);
            $images = is_array($images) ? $images : [$images]; //If images is not array, make it array
            //Upload New Image to Cloudinary:
            foreach ($images as $image) {
                $upload = Cloudinary::upload($image->getRealPath(), [
                    'folder' => 'ecommerce_laravel_api/images/products',
                ]);
                //Store New Image in Database(where product_id = :id):
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $upload->getSecurePath(),
                    'public_id' => $upload->getPublicId(),
                ]);
            }
        }
        //Get Updated Product to Show in Responce:
        $updatedProduct = $product->fresh('productImage');

        // Response:
        return response()->json([
            'status' => true,
            'message' => 'Product updated successfully',
            'product' => $updatedProduct,
        ], 200);
    }
    // Test on Postman:
    // URL: POST: http://localhost:8000/api/admin/products/{id}
    // Headers: Authorization: Bearer <token>
    // Body: form-data
    // category_id: Number
    // name: String
    // slug: String
    // description: String
    // price: Number
    // stock: Number
    // images[]: File (Optional: if not upload, it will not be added)
    // _method:PUT
    // }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Delete Product:
        $product = Product::with('productImage')->find($id);
        if ($product) {
            // Delete all images of product from Cloudinary:
            if ($product->productImage->isNotEmpty()) {
                foreach ($product->productImage as $image) {
                    Cloudinary::destroy($image->public_id);
                }
            }
            // Delete Product:
            $product->delete();

            return response()->json([
                'status' => true,
                'message' => 'Product deleted successfully',
                'product' => $product,
            ], 200);
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Product not found',
            ], 404);
        }
    }
    // Test on Postman:
    // URL: POST: http://localhost:8000/api/admin/products/{id}
    // Headers: Authorization: Bearer <token>
}
