<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

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
        try {
            Log::info('HealthPost update request for ID: ' . $id, $request->all());
            
            $healthPost = HealthPost::findOrFail($id);
            Log::info('Found health post: ' . $healthPost->name);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'nullable|string|max:255',
                'contact_phone' => 'nullable|string|max:20',
                'contact_email' => 'nullable|email|max:255',
                'image' => 'nullable|string',
                'services' => 'nullable|array',
                'operating_hours' => 'nullable|string',
                'is_active' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed for health post update', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Safe update - update each field individually to avoid issues
            if ($request->has('name') && !empty($request->name)) {
                $healthPost->name = $request->name;
            }
            if ($request->has('description')) {
                $healthPost->description = $request->description;
            }
            if ($request->has('location')) {
                $healthPost->location = $request->location;
            }
            if ($request->has('contact_phone')) {
                $healthPost->contact_phone = $request->contact_phone;
            }
            if ($request->has('contact_email')) {
                $healthPost->contact_email = $request->contact_email;
            }
            if ($request->has('image')) {
                $healthPost->image = $request->image;
            }
            if ($request->has('services')) {
                $healthPost->services = $request->services;
            }
            if ($request->has('operating_hours')) {
                $healthPost->operating_hours = $request->operating_hours;
            }
            if ($request->has('is_active')) {
                $healthPost->is_active = (bool) $request->is_active;
            }
            
            $healthPost->save();
            Log::info('Health post updated successfully');

            return response()->json([
                'success' => true,
                'message' => 'Health post updated successfully',
                'data' => $healthPost
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Health post not found: ' . $id);
            return response()->json([
                'success' => false,
                'message' => 'Health post not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('HealthPost Update Error: ' . $e->getMessage() . ' File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update health post: ' . $e->getMessage()
            ], 500);
        }
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
