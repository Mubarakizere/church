<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $services = Service::active()->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $services,
            'total' => $services->count()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'time' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'description' => 'required|string',
            'features' => 'nullable|array',
            'language' => 'required|string|in:english,kinyarwanda,mixed',
            'is_active' => 'boolean',
            'display_order' => 'integer'
        ]);

        $service = Service::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully',
            'data' => $service
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $service = Service::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'time' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'features' => 'nullable|array',
            'language' => 'sometimes|required|string|in:english,kinyarwanda,mixed',
            'is_active' => 'boolean',
            'display_order' => 'integer'
        ]);

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully',
            'data' => $service
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully'
        ]);
    }
}
