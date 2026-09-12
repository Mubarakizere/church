<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class HealthCenterController extends Controller
{
    /**
     * Display a listing of the health centers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $healthCenters = HealthCenter::where('is_active', true)->get();
        return response()->json($healthCenters);
    }

    /**
     * Store a newly created health center in storage.
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

        $healthCenter = HealthCenter::create($request->all());

        return response()->json($healthCenter, 201);
    }

    /**
     * Display the specified health center.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $healthCenter = HealthCenter::findOrFail($id);
        return response()->json($healthCenter);
    }

    /**
     * Update the specified health center in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            Log::info('HealthCenter update request for ID: ' . $id, $request->all());
            
            $healthCenter = HealthCenter::findOrFail($id);
            Log::info('Found health center: ' . $healthCenter->name);

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
                Log::error('Validation failed for health center update', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Safe update - update each field individually to avoid issues
            if ($request->has('name') && !empty($request->name)) {
                $healthCenter->name = $request->name;
            }
            if ($request->has('description')) {
                $healthCenter->description = $request->description;
            }
            if ($request->has('location')) {
                $healthCenter->location = $request->location;
            }
            if ($request->has('contact_phone')) {
                $healthCenter->contact_phone = $request->contact_phone;
            }
            if ($request->has('contact_email')) {
                $healthCenter->contact_email = $request->contact_email;
            }
            if ($request->has('image')) {
                $healthCenter->image = $request->image;
            }
            if ($request->has('services')) {
                $healthCenter->services = $request->services;
            }
            if ($request->has('operating_hours')) {
                $healthCenter->operating_hours = $request->operating_hours;
            }
            if ($request->has('is_active')) {
                $healthCenter->is_active = (bool) $request->is_active;
            }
            
            $healthCenter->save();
            Log::info('Health center updated successfully');

            return response()->json([
                'success' => true,
                'message' => 'Health center updated successfully',
                'data' => $healthCenter
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Health center not found: ' . $id);
            return response()->json([
                'success' => false,
                'message' => 'Health center not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('HealthCenter Update Error: ' . $e->getMessage() . ' File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update health center: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified health center from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $healthCenter = HealthCenter::findOrFail($id);
        $healthCenter->delete();

        return response()->json(null, 204);
    }
}
