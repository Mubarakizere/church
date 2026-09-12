<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class AdminTeamController extends Controller
{
    /**
     * Display a listing of team members for admin
     */
    public function index(Request $request)
    {
        $query = Team::query();

        // Filter by category if provided
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $teams = $query->orderBy('category')
                      ->orderBy('name')
                      ->get();

        return response()->json([
            'success' => true,
            'data' => $teams,
            'total' => $teams->count()
        ]);
    }

    /**
     * Store a newly created team member
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:bishop,archdeacon,department',
            'description' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:102400',
            'region' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            Log::error('Team validation failed:', [
                'errors' => $validator->errors(),
                'data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Set default values
        $data['is_active'] = $data['is_active'] ?? true;
        $data['display_order'] = $data['display_order'] ?? 0;

        // Handle image upload
        if ($request->hasFile('image')) {
            Log::info('Image file detected:', ['file' => $request->file('image')->getClientOriginalName()]);
            $imagePath = $request->file('image')->store('team-images', 'public');
            
            // Optimize the uploaded image
            $this->optimizeImage(storage_path('app/public/' . $imagePath));
            
            $data['image'] = '/storage/' . $imagePath;
            Log::info('Image stored at:', ['path' => $data['image']]);
        } else {
            Log::info('No image file detected in request');
            $data['image'] = '/placeholder.svg';
        }

        $team = Team::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Team member created successfully',
            'data' => $team
        ], 201);
    }

    /**
     * Display the specified team member
     */
    public function show(string $id)
    {
        $team = Team::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $team
        ]);
    }

    /**
     * Update the specified team member
     */
    public function update(Request $request, string $id)
    {
        try {
            Log::info('=== TEAM UPDATE REQUEST START ===');
            Log::info('Attempting to update team member with ID: ' . $id);
            Log::info('Request method: ' . $request->method());
            Log::info('Content type: ' . $request->header('Content-Type'));
            Log::info('Has file image: ' . ($request->hasFile('image') ? 'YES' : 'NO'));

            $team = Team::findOrFail($id);
            Log::info('Found team member: ' . $team->name);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'title' => 'sometimes|required|string|max:255',
                'category' => 'sometimes|required|string|in:bishop,archdeacon,department',
                'description' => 'nullable|string',
                'email' => 'nullable|email|unique:teams,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:102400',
                'region' => 'nullable|string|max:255',
                'is_active' => 'nullable|boolean',
                'display_order' => 'nullable|integer',
                'department_type' => 'nullable|string|max:255',
                'icon' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed for team update:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            Log::info('Request data received:', ['data' => $data]);
            Log::info('Request files:', ['files' => $request->allFiles()]);
            Log::info('Request has file image:', ['has_image' => $request->hasFile('image') ? 'YES' : 'NO']);

            // Handle image upload
            if ($request->hasFile('image')) {
                Log::info('Processing image upload for team update');
                // Delete old image if exists
                if ($team->image && $team->image !== '/placeholder.svg') {
                    $oldImagePath = str_replace('/storage/', '', $team->image);
                    Storage::disk('public')->delete($oldImagePath);
                }

                $imagePath = $request->file('image')->store('team-images', 'public');
                
                // Optimize the uploaded image
                $this->optimizeImage(storage_path('app/public/' . $imagePath));
                
                $data['image'] = '/storage/' . $imagePath;
                Log::info('Image updated: ' . $data['image']);
            } else {
                Log::info('No image file in request');
            }

            Log::info('Data to update:', ['data' => $data]);
            $team->update($data);
            Log::info('Team member updated successfully.', ['image_path' => $team->fresh()->image]);

            return response()->json([
                'success' => true,
                'message' => 'Team member updated successfully',
                'data' => $team
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating team member: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update team member: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified team member
     */
    public function destroy(string $id)
    {
        try {
            Log::info('Attempting to delete team member with ID: ' . $id);

            $team = Team::findOrFail($id);
            Log::info('Found team member: ' . $team->name);

            // Delete associated image if exists
            if ($team->image && $team->image !== '/placeholder.svg') {
                $imagePath = str_replace('/storage/', '', $team->image);
                Log::info('Deleting image: ' . $imagePath);
                Storage::disk('public')->delete($imagePath);
            }

            $team->delete();
            Log::info('Team member deleted successfully');

            return response()->json([
                'success' => true,
                'message' => 'Team member deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting team member: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete team member: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update team members
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:teams,id',
            'updates.*.is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = 0;
        foreach ($request->updates as $update) {
            Team::where('id', $update['id'])->update([
                'is_active' => $update['is_active'] ?? true
            ]);
            $updated++;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully updated {$updated} team members"
        ]);
    }

    /**
     * Get team statistics for admin dashboard
     */
    public function statistics()
    {
        $stats = [
            'total' => Team::count(),
            'active' => Team::where('is_active', true)->count(),
            'inactive' => Team::where('is_active', false)->count(),
            'by_category' => [
                'bishop' => Team::where('category', 'bishop')->count(),
                'archdeacons' => Team::where('category', 'archdeacon')->count(),
                'departments' => Team::where('category', 'department')->count(),
            ],
            'recent_additions' => Team::where('created_at', '>=', Carbon::now()->subDays(30))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Reorder team members
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:teams,id',
            'orders.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->orders as $order) {
            Team::where('id', $order['id'])->update(['display_order' => $order['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Team members reordered successfully'
        ]);
    }

    /**
     * Optimize uploaded image for better quality and smaller file size
     */
    private function optimizeImage($imagePath)
    {
        try {
            // Check if GD extension is available
            if (!extension_loaded('gd')) {
                Log::warning('GD extension not available, skipping image optimization');
                return;
            }

            // Get image info
            $imageInfo = getimagesize($imagePath);
            if (!$imageInfo) {
                Log::warning('Could not get image info for optimization');
                return;
            }

            $width = $imageInfo[0];
            $height = $imageInfo[1];
            $mimeType = $imageInfo['mime'];

            // Only optimize if image is larger than 300x300 (to avoid upscaling small images)
            if ($width < 300 || $height < 300) {
                Log::info('Image is already small enough, skipping optimization');
                return;
            }

            // Create image resource based on MIME type
            switch ($mimeType) {
                case 'image/jpeg':
                    $sourceImage = imagecreatefromjpeg($imagePath);
                    break;
                case 'image/png':
                    $sourceImage = imagecreatefrompng($imagePath);
                    break;
                case 'image/gif':
                    $sourceImage = imagecreatefromgif($imagePath);
                    break;
                default:
                    Log::warning('Unsupported image type for optimization: ' . $mimeType);
                    return;
            }

            if (!$sourceImage) {
                Log::warning('Could not create image resource for optimization');
                return;
            }

            // Calculate new dimensions (maintain aspect ratio, max 800x800)
            $maxSize = 800;
            if ($width > $height) {
                $newWidth = $maxSize;
                $newHeight = ($height * $maxSize) / $width;
            } else {
                $newHeight = $maxSize;
                $newWidth = ($width * $maxSize) / $height;
            }

            // Create new optimized image
            $optimizedImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // Preserve transparency for PNG and GIF
            if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
                imagealphablending($optimizedImage, false);
                imagesavealpha($optimizedImage, true);
                $transparent = imagecolorallocatealpha($optimizedImage, 255, 255, 255, 127);
                imagefilledrectangle($optimizedImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            // Resample the image with high quality
            imagecopyresampled(
                $optimizedImage, $sourceImage,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $width, $height
            );

            // Save optimized image with high quality
            switch ($mimeType) {
                case 'image/jpeg':
                    imagejpeg($optimizedImage, $imagePath, 90); // 90% quality
                    break;
                case 'image/png':
                    imagepng($optimizedImage, $imagePath, 8); // Compression level 8 (0-9)
                    break;
                case 'image/gif':
                    imagegif($optimizedImage, $imagePath);
                    break;
            }

            // Clean up memory
            imagedestroy($sourceImage);
            imagedestroy($optimizedImage);

            Log::info('Image optimized successfully', [
                'original_size' => $width . 'x' . $height,
                'optimized_size' => $newWidth . 'x' . $newHeight,
                'file' => $imagePath
            ]);

        } catch (\Exception $e) {
            Log::error('Image optimization failed: ' . $e->getMessage());
            // Don't throw exception, just log the error and continue
        }
    }
}
