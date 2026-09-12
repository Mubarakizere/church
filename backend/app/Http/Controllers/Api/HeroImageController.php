<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroImage;
use Illuminate\Support\Facades\Log;

class HeroImageController extends Controller
{
    /**
     * Public endpoint: list hero images for the site
     */
    public function index()
    {
        try {
            $heroImages = HeroImage::query()
                ->orderBy('display_order', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $heroImages,
                'total' => $heroImages->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch public hero images: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch hero images',
            ], 500);
        }
    }
}


