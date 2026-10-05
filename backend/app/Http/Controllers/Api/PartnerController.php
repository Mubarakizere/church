<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PartnerController extends Controller
{
    /**
     * Display a listing of the partners.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Partner::query();

            if (!$request->boolean('all') && $request->input('status') !== 'all') {
                $query->active();
            }

            $partners = $query->ordered()->get();
            
            return response()->json([
                'success' => true,
                'data' => $partners,
                'total' => $partners->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch partners',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created partner in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Clean up empty strings to null for nullable fields
        $data = $request->all();
        foreach (['country', 'type', 'description', 'website', 'email', 'category', 'logo_url'] as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'country' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string', // Changed from url to string for more flexibility
            'email' => 'nullable|string', // Changed from email to string for more flexibility
            'logo' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'logo_url' => 'nullable|string', // For base64 or URL
            'category' => 'nullable|string|max:100',
            'is_active' => 'nullable',
            'display_order' => 'nullable'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Start with request data, not just validated (for file handling)
            $data = $request->all();

            // Clean up empty strings to null for nullable fields
            foreach (['country', 'type', 'description', 'website', 'email', 'category', 'logo_url'] as $field) {
                if (isset($data[$field]) && $data[$field] === '') {
                    $data[$field] = null;
                }
            }

            // Handle logo upload
            if ($request->hasFile('logo')) {
                try {
                    $logoPath = $request->file('logo')->store('partner-logos', 'public');
                    // Store relative storage path; frontend builds absolute URL
                    $data['logo'] = '/storage/' . $logoPath;
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to upload logo: ' . $e->getMessage()
                    ], 500);
                }
            } elseif ($request->has('logo_url') && $request->logo_url) {
                // Handle base64 or URL logo
                $data['logo'] = $request->logo_url;
            }

            // Convert string boolean to actual boolean
            if (isset($data['is_active'])) {
                $data['is_active'] = in_array($data['is_active'], ['1', 'true', true], true);
            } else {
                $data['is_active'] = true; // Default to active
            }

            // Ensure display_order is integer
            if (isset($data['display_order'])) {
                $data['display_order'] = (int) $data['display_order'];
            } else {
                $data['display_order'] = 0; // Default order
            }

            // Remove _method field if present (used for FormData PUT simulation)
            unset($data['_method']);

            // Only include fields that exist in the fillable array
            $fillableData = array_intersect_key($data, array_flip([
                'name', 'country', 'type', 'description', 'website', 'email',
                'logo', 'category', 'is_active', 'display_order'
            ]));

            $partner = Partner::create($fillableData);

            return response()->json([
                'success' => true,
                'data' => $partner,
                'message' => 'Partner created successfully'
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Partner creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $fillableData ?? 'No data'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create partner: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified partner.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $partner = Partner::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $partner
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Partner not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified partner in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Clean up empty strings to null for nullable fields
        $data = $request->all();
        foreach (['country', 'type', 'description', 'website', 'email', 'category', 'logo_url'] as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        $validator = Validator::make($data, [
            'name' => 'sometimes|required|string|max:255',
            'country' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string', // Changed from url to string for more flexibility
            'email' => 'nullable|string', // Changed from email to string for more flexibility
            'logo' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'logo_url' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'is_active' => 'nullable',
            'display_order' => 'nullable'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $partner = Partner::findOrFail($id);

            // Start with request data, not just validated (for file handling)
            $data = $request->all();

            // Clean up empty strings to null for nullable fields
            foreach (['country', 'type', 'description', 'website', 'email', 'category', 'logo_url'] as $field) {
                if (isset($data[$field]) && $data[$field] === '') {
                    $data[$field] = null;
                }
            }

            // Handle logo upload
            if ($request->hasFile('logo')) {
                try {
                    $logoPath = $request->file('logo')->store('partner-logos', 'public');
                    // Store relative storage path; frontend builds absolute URL
                    $data['logo'] = '/storage/' . $logoPath;
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to upload logo: ' . $e->getMessage()
                    ], 500);
                }
            } elseif ($request->has('logo_url') && $request->logo_url) {
                // Handle base64 or URL logo
                $data['logo'] = $request->logo_url;
            }

            // Convert string boolean to actual boolean
            if (isset($data['is_active'])) {
                $data['is_active'] = in_array($data['is_active'], ['1', 'true', true], true);
            }

            // Ensure display_order is integer
            if (isset($data['display_order'])) {
                $data['display_order'] = (int) $data['display_order'];
            }

            // Remove _method field if present (used for FormData PUT simulation)
            unset($data['_method']);

            // Only include fields that exist in the fillable array
            $fillableData = array_intersect_key($data, array_flip([
                'name', 'country', 'type', 'description', 'website', 'email',
                'logo', 'category', 'is_active', 'display_order'
            ]));

            $partner->update($fillableData);

            return response()->json([
                'success' => true,
                'data' => $partner,
                'message' => 'Partner updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update partner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified partner from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $partner = Partner::findOrFail($id);
            $partner->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Partner deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete partner',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
