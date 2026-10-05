<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class HeroImageController extends Controller
{
    /**
     * Display a listing of the hero images.
     */
    public function index()
    {
        try {
            // Simple query first to test
            $heroImages = HeroImage::all();
            
            return response()->json([
                'success' => true,
                'data' => $heroImages,
                'total' => $heroImages->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch hero images: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch hero images: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created hero image in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'required|string|max:500',
            'display_order' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'src' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:66560', // 65MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['title', 'subtitle', 'display_order', 'is_active']);
            
            // Handle image upload or provided src
            if ($request->hasFile('image')) {
                Log::info('Hero image file detected:', ['file' => $request->file('image')->getClientOriginalName()]);
                $imagePath = $request->file('image')->store('hero-images', 'public');
                $data['src'] = '/storage/' . $imagePath;
                Log::info('Hero image stored at:', ['path' => $data['src']]);
            } elseif ($request->filled('src')) {
                $data['src'] = $request->input('src');
            } else {
                // Use placeholder or default image
                $data['src'] = '/placeholder.svg';
                Log::info('No hero image file detected, using placeholder');
            }

            $heroImage = HeroImage::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Hero image created successfully',
                'data' => $heroImage
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create hero image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create hero image'
            ], 500);
        }
    }

    /**
     * Display the specified hero image.
     */
    public function show($id)
    {
        try {
            $heroImage = HeroImage::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $heroImage
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch hero image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Hero image not found'
            ], 404);
        }
    }

    /**
     * Update the specified hero image in storage.
     */
    public function update(Request $request, $id)
    {
        // Convert string boolean values before validation
        $input = $request->all();
        if (isset($input['is_active']) && is_string($input['is_active'])) {
            $input['is_active'] = in_array(strtolower($input['is_active']), ['1', 'true', 'yes']) ? true : false;
            $request->merge($input);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'subtitle' => 'sometimes|required|string|max:500',
            'display_order' => 'sometimes|required|integer|min:1',
            'is_active' => 'sometimes|boolean',
            'src' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:66560', // 65MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $heroImage = HeroImage::findOrFail($id);
            
            // Prepare update data
            $data = [];
            if ($request->has('title')) {
                $data['title'] = $request->input('title');
            }
            if ($request->has('subtitle')) {
                $data['subtitle'] = $request->input('subtitle');
            }
            if ($request->has('display_order')) {
                $data['display_order'] = $request->input('display_order');
            }
            
            // Handle boolean conversion for is_active
            if ($request->has('is_active')) {
                $isActive = $request->input('is_active');
                // Convert string '1'/'0' or 'true'/'false' to boolean
                if (is_string($isActive)) {
                    $data['is_active'] = in_array(strtolower($isActive), ['1', 'true', 'yes']);
                } else {
                    $data['is_active'] = (bool) $isActive;
                }
            }
            
            // Handle image upload or provided src
            if ($request->hasFile('image')) {
                Log::info('Hero image update file detected:', ['file' => $request->file('image')->getClientOriginalName()]);
                
                // Delete old image if it exists and is not placeholder
                if ($heroImage->src && $heroImage->src !== '/placeholder.svg' && $heroImage->src !== '/storage/placeholder.svg') {
                    $oldImagePath = str_replace('/storage/', '', $heroImage->src);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                
                $imagePath = $request->file('image')->store('hero-images', 'public');
                $data['src'] = '/storage/' . $imagePath;
                Log::info('Hero image updated at:', ['path' => $data['src']]);
            } elseif ($request->filled('src')) {
                $data['src'] = $request->input('src');
            }

            Log::info('Updating hero image with data:', $data);
            $heroImage->update($data);
            $heroImage->refresh();
            
            // Log the updated image src for debugging
            Log::info('Hero image updated - new src:', ['src' => $heroImage->src, 'id' => $heroImage->id]);

            return response()->json([
                'success' => true,
                'message' => 'Hero image updated successfully',
                'data' => $heroImage->fresh() // Use fresh() to ensure we get the latest data
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update hero image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update hero image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified hero image from storage.
     */
    public function destroy($id)
    {
        try {
            $heroImage = HeroImage::findOrFail($id);
            
            // Delete image file if it exists and is not placeholder
            if ($heroImage->src && $heroImage->src !== '/placeholder.svg' && $heroImage->src !== '/storage/placeholder.svg') {
                $imagePath = str_replace('/storage/', '', $heroImage->src);
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
            
            $heroImage->delete();

            return response()->json([
                'success' => true,
                'message' => 'Hero image deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete hero image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete hero image'
            ], 500);
        }
    }
}
