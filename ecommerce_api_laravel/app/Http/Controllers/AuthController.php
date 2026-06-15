<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Auth;
use Throwable;



class AuthController extends Controller
{
    public function register(Request $request)
    {

        //Register:
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:3',
            'image' => 'nullable|image', // Optional image upload
        ]);


        $validated['password'] = Hash::make($validated['password']);

        $uploadWarning = null;

        //Check if image is exist: if exist, upload to cloudinary
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                $upload = Cloudinary::upload($file->getRealPath(), [
                    'folder' => 'ecommerce_laravel_api/images/profiles',
                ]);

                //Save Image to Database (URL & Public ID)
                $validated['image_url'] = $upload->getSecurePath();
                $validated['public_id'] = $upload->getPublicId();
            } catch (Throwable $e) {
                // Keep registration successful even when cloud upload is not configured.
                $uploadWarning = 'Image upload failed. User created without profile image.';
            }
        }
        //Create User
        $user = User::create($validated);

        //Response
        return response()->json([
            'status' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'warning' => $uploadWarning
        ], 201);
    }
    //Test on Postman:
    //URL: POST: http://localhost:8000/api/auth/register
    //Body:form-data
    //name: string
    //email: string
    //password: string
    //image: file
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);
        if (!Auth::attempt($data)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }
        // Get user from database
        $user = Auth::user();
        $token = $user->createToken('my-app-token')->plainTextToken;

        //Response
        return response()->json([
            'status' => true,
            'message' => 'User logged in successfully',
            'user' => $user,
            'token' => $token,
        ], 200);
    }
    //Test on Postman:
    //URL: POST: http://localhost:8000/api/auth/login
    //Body:form-data
    //email: string
    //password: string

    //Get Profile:
    public function getProfile(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'status' => true,
            'message' => 'User profile fetched successfully',
            'user' => $user,
        ], 200);
    }
    //Test on Postman:
    //URL: GET: http://localhost:8000/api/user/profile
    //Headers: Authorization: Bearer <token>
    

    //Logout:
    public function logout(Request $request)
    {
        /** @var \Laravel\Sanctum\PersonalAccessToken $token */
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        } else {
            return response()->json([
                'status' => false,
                'message' => 'User is already logged out',
            ], 401);
        }
        return response()->json([
            'status' => true,
            'message' => 'User logged out successfully',
            'user' => $request->user()
        ], 200);
    }
    //Test on Postman:
    //URL: POST: http://localhost:8000/api/user/logout
    //Headers: Authorization: Bearer <token>





}
