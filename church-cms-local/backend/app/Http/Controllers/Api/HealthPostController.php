<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HealthPostController extends Controller
{
    /**
     * Display a listing of the health posts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $healthPosts = HealthPost::where('is_active', true)->get();
        return response()->json($healthPosts);
    }

    /**
     * Store a newly created health post in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'image' => 'nullable|string',
            'services' => 'nullable|array',
            'operating_hours' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $healthPost = HealthPost::create($request->all());

        return response()->json($healthPost, 201);
    }

    /**
     * Display the specified health post.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $healthPost = HealthPost::findOrFail($id);
        return response()->json($healthPost);
    }

    /**
     * Update the specified health post in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $healthPost = HealthPost::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'image' => 'nullable|string',
            'services' => 'nullable|array',
            'operating_hours' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $healthPost->update($request->all());

        return response()->json($healthPost);
    }

    /**
     * Remove the specified health post from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $healthPost = HealthPost::findOrFail($id);
        $healthPost->delete();

        return response()->json(null, 204);
    }
}
