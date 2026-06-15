<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Throwable;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     * admin-only access, and admin user CRUD behavior:
     */
    public function index()
    {
        //Get all users from database(by Admin):
        return response()->json([
            'status' => true,
            'message' => 'Welcome to User Dashboard',
            'number of users' => User::count(),
            'user' => User::all(),
        ], 200);
    }
    //Test on Postman:
    //URL: GET: http://localhost:8000/api/admin/users
    //Headers: Authorization: Bearer <token>

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //Create User Account:
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:3',
            'image' => 'nullable|image',
            'role' => 'nullable|string',
        ]);
        //Check if role is admin, set it to admin. Otherwise, set it to user.
        if ($request->filled('role')) {
            $validated['role'] = $validated['role'];
        }else{
            $validated['role'] = 'user';
        }

        $validated['password'] = Hash::make($validated['password']);

        //Image Upload:
        $uploadWarning = null;
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                $upload = Cloudinary::upload($file->getRealPath(), [
                    'folder' => 'ecommerce_laravel_api/images/profiles',
                ]);
                $validated['image_url'] = $upload->getSecurePath();
                $validated['public_id'] = $upload->getPublicId();
            } catch (\Throwable $e) {
                $uploadWarning = 'Image upload failed. User created without profile image.';
            }
        }
        $user = User::create($validated);

        //Response:
        return response()->json([
            'status' => true,
            'message' => 'User created successfully',
            'user' => $user,
            'role' => $user->role,
            'warning' => $uploadWarning
        ], 201);
        
    }
    //Test on Postman:
    //URL: POST: http://localhost:8000/api/admin/users
    //Headers: Authorization: Bearer <token>
    //Body:form-data
    //name: string
    //email: string
    //password: string
    //image: file
    

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //Get the User by ID:
        $user = User::findOrFail($id);

        return response()->json([
            'status' => true,
            'message' => 'Get user by ID successfully',
            'user' => $user,
        ], 200);
    }
    //Test on Postman:
    //URL: GET: http://localhost:8000/api/admin/users/{id}
    //Headers: Authorization: Bearer <token>

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //Update User Account:
        //Find User in Database(by ID):
        $user = User::findOrFail($id);

        //Validate the request data:
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id, //Unique Rule: same field but diff row. Ex: User A has email a@a, User B also has email a@a, but it is not allowed
            'role' => 'nullable|string',
            'password' => 'nullable|string|min:3',
            'image' => 'nullable|image', // Optional image upload
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        if ($request->filled('role')) {
            $updateData['role'] = $validated['role'];
        }
        
        //Update Image:
        if($request->hasFile('image')){
            //Delete Old Image in Cloudinary: 
            if($user->public_id){
                Cloudinary::destroy($user->public_id);
            }
            //Upload New Image to Cloudinary:
            $file = $request->file('image');
            $upload = Cloudinary::upload($file->getRealPath(), [
                'folder' => 'ecommerce_laravel_api/images/profiles',
            ]);
            //Update New Image in Database:
            $updateData['image_url'] = $upload->getSecurePath();
            $updateData['public_id'] = $upload->getPublicId();
        }

        //Update User
        $user->update($updateData);

        return response()->json([
            'status' => true,
            'message' => 'User updated successfully',
            'user' => $user->fresh(),
        ], 200);
    }
    //Test on Postman:
    //URL: POST: http://localhost:8000/api/admin/users/{id}
    //Headers: Authorization: Bearer <token>
    //Body:form-data
    //name: string
    //email: string
    //password: string
    //role: string
    //image: file
    //_method: put


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //Delete User Account:
        //Find User in Database(by ID):
        $user = User::findOrFail($id);
        
        //Delete the Image in Cloudinary:
        if ($user->public_id) {
            Cloudinary::destroy($user->public_id);
        }
        
        //Delete the User in Database:
        $user->delete();

        //Response:
        return response()->json([
            'status' => true,
            'message' => 'User deleted successfully',
            'user' => $user,
        ], 200);
    }
    //Test on Postman:
    //URL: DELETE: http://localhost:8000/api/admin/users/{id}
    //Headers: Authorization: Bearer <token>
}
