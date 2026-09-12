<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        $healthCenter = HealthCenter::findOrFail($id);

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

        $healthCenter->update($request->all());

        return response()->json($healthCenter);
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
