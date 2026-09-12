<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload an image file.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        try {
            Log::info('Image upload request received', [
                'has_file' => $request->hasFile('image'),
                'files' => $request->allFiles()
            ]);

            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:61440', // 60MB max
                'folder' => 'nullable|string|in:news,gallery,events,team,general'
            ]);

            if (!$request->hasFile('image')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No image file provided'
                ], 400);
            }

            $image = $request->file('image');
            $folder = $request->input('folder', 'general');
            
            // Generate unique filename
            $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            
            // Store in public disk under images/{folder}
            $path = $image->storeAs("images/{$folder}", $filename, 'public');
            
            // Generate URL
            $url = '/storage/' . $path;
            
            Log::info('Image uploaded successfully', [
                'path' => $path,
                'url' => $url
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => $url,
                    'path' => $path,
                    'filename' => $filename
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Image upload validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Image upload error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload multiple images.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadMultiple(Request $request)
    {
        try {
            $request->validate([
                'images' => 'required|array',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:61440',
                'folder' => 'nullable|string|in:news,gallery,events,team,general'
            ]);

            $folder = $request->input('folder', 'general');
            $uploadedImages = [];

            foreach ($request->file('images') as $image) {
                $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs("images/{$folder}", $filename, 'public');
                $url = '/storage/' . $path;
                
                $uploadedImages[] = [
                    'url' => $url,
                    'path' => $path,
                    'filename' => $filename
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully',
                'data' => $uploadedImages
            ]);

        } catch (\Exception $e) {
            Log::error('Multiple image upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload images: ' . $e->getMessage()
            ], 500);
        }
    }
}

