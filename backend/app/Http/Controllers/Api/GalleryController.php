<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class GalleryController extends Controller
{
    /**
     * Display a listing of gallery images.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Gallery::query()->active()->ordered();
            $images = $query->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);
        } catch (\Exception $e) {
            Log::error('Gallery Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gallery images'
            ], 500);
        }
    }

    /**
     * Store a newly created gallery image.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            Log::info('Gallery store request', $request->all());

            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'image_url' => 'required|string|max:2048',
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                Log::error('Gallery validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $imageData = [
                'image_url' => $request->image_url,
                'title' => $request->title,
                'description' => $request->description,
                'display_order' => $request->display_order ?? 0,
                'is_active' => $request->is_active ?? true,
            ];

            $image = Gallery::create($imageData);
            Log::info('Gallery image created successfully', ['id' => $image->id]);

            return response()->json([
                'success' => true,
                'message' => 'Gallery image added successfully',
                'data' => $image
            ], 201);

        } catch (\Exception $e) {
            Log::error('Gallery Store Error: ' . $e->getMessage() . ' File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add gallery image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified gallery image.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $image = Gallery::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $image
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Gallery Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gallery image'
            ], 500);
        }
    }

    /**
     * Update the specified gallery image.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            Log::info('Gallery update request for ID: ' . $id, $request->all());
            
            $image = Gallery::findOrFail($id);
            Log::info('Found gallery image: ' . $image->title);

            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'image_url' => 'sometimes|required|string|max:2048',
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed for gallery update', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Safe update - update each field individually
            if ($request->has('title') && !empty($request->title)) {
                $image->title = $request->title;
            }
            if ($request->has('description')) {
                $image->description = $request->description;
            }
            if ($request->has('image_url')) {
                $image->image_url = $request->image_url;
            }
            if ($request->has('display_order')) {
                $image->display_order = $request->display_order;
            }
            if ($request->has('is_active')) {
                $image->is_active = (bool) $request->is_active;
            }
            
            $image->save();
            Log::info('Gallery image updated successfully');

            return response()->json([
                'success' => true,
                'message' => 'Gallery image updated successfully',
                'data' => $image
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Gallery image not found: ' . $id);
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Gallery Update Error: ' . $e->getMessage() . ' File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update gallery image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified gallery image.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            $image = Gallery::findOrFail($id);
            $image->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gallery image deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Gallery Delete Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete gallery image'
            ], 500);
        }
    }

}

